const { Pool } = require('pg')

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'nutechtes',
//     password: 'postgres',
//     port: 5432
// })

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
})

module.exports = pool

