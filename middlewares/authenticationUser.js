const { verifyToken } = require('../helpers/jwt')
const db = require('../connection')


async function authentication(req, res, next) {
    try {

        const { authorization } = req.headers

        if (!authorization) {
            throw { name: "Token tidak tidak valid atau kadaluwarsa" }
        }
        const token = req.headers.authorization.split(' ')[1]
        const payload = verifyToken(token)

        const query = 'SELECT * FROM users WHERE id = $1'
        const result = await db.query(query, [payload.id])

        if (!result) {
            throw { name: "Token tidak tidak valid atau kadaluwarsa" }
        }

        req.user = {
            id: payload.id
        }

    } catch (error) {
        console.log(error);
        next(error)
    }
    next()
}

module.exports = authentication