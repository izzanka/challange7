const bcrypt = require('bcrypt')

const crypt = async (value) => {
    const saltRounds = 8
    return bcrypt.hash(value, saltRounds)
}

module.exports = {
    crypt   
}