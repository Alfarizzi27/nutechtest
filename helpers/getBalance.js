const db = require('../connection')


async function getBalance(userid) {
    const query = 'SELECT * FROM balances WHERE "UserId" = $1'
    const result = await db.query(query, [userid])
    const balance = result.rows[0].balance

    return balance
}

module.exports = getBalance