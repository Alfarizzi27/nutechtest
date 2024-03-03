const jwt = require("jsonwebtoken")

function generateToken(payload, expired) {
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: expired })
    return token
}

function verifyToken(payload) {
    const verify = jwt.verify(payload, process.env.SECRET)
    return verify
}

module.exports = { generateToken, verifyToken }

