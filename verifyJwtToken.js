const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token){
        return res.status(401).json({
            error: true,
            message: 'unauntheticated.'
        });
    }

    try {

        const jwtPayload = jwt.verify(token, process.env.SECRET_KEY);

        res.user = jwtPayload

        next();

    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                error: true,
                message: 'token expired.'
            });
        } else {
            console.log(error);
            return res.status(500).json({
                error: true,
                message: 'server error.'
            });
        }
    }
};

module.exports = {verifyToken};