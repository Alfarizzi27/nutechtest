const bcrypt = require('bcryptjs');
const validator = require('validator')
const db = require('../connection')
const getBalance = require('../helpers/getBalance')
const { generateToken } = require('../helpers/jwt')

class UserController {
    static async register(req, res, next) {
        try {
            const { email, first_name, last_name, password } = req.body
            const validateEmail = validator.isEmail(email)

            if (!validateEmail) {
                throw { name: "Validate Email" }
            }
            if (password.length < 8) {
                throw { name: "Minimum password 8" }
            }

            const checkEmail = 'SELECT * FROM users WHERE email = $1'
            const resultEmail = await db.query(checkEmail, [email])

            if (resultEmail.rows.length > 0) throw { name: "Email already taken" }

            const hashPassword = bcrypt.hashSync(password, 8);
            const queryInsert = 'INSERT INTO users (email, first_name, last_name, password) VALUES ($1, $2, $3, $4)';
            await db.query(queryInsert, [email, first_name, last_name, hashPassword]);
            const newUser = await db.query(checkEmail, [email])

            const queryBalance = 'INSERT INTO balances ("UserId", balance, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4)'
            await db.query(queryBalance, [newUser.rows[0].id, 0, new Date(), new Date()])

            res.status(201).json({ status: 0, message: "Registrasi berhasil silahkan login", data: null })

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body

            const validateEmail = validator.isEmail(email)
            if (!validateEmail) {
                throw { name: "Validate Email" }
            }
            if (password.length < 8) {
                throw { name: "Minimum password 8" }
            }

            const query = 'SELECT * FROM users WHERE email = $1'
            const result = await db.query(query, [email])

            if (result.rows.length === 0) {
                throw { name: "Username atau password salah" }
            }

            const matchPassword = bcrypt.compareSync(password, result.rows[0].password)
            if (!matchPassword) {
                throw { name: "Username atau password salah" }
            }

            const payload = { id: result.rows[0].id, email: result.rows[0].email }
            const expired = Math.floor(Date.now() / 1000) + (12 * 60 * 60)

            const bearerToken = generateToken(payload, expired)

            res.status(200).json({ status: 0, message: "Login Sukses", data: { token: bearerToken } })

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async balance(req, res, next) {
        try {
            const userId = req.user.id
            const balance = await getBalance(userId)
            res.status(200).json({ status: 0, message: "Get Balance Berhasil", data: { balance } })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async topup(req, res, next) {
        try {
            const amount = req.body.top_up_amount
            const userId = req.user.id

            if (isNaN(amount) || amount <= 0) {
                throw { name: "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0" }
            }

            const query = 'SELECT * FROM balances WHERE "UserId" = $1'
            const result = await db.query(query, [userId])

            const updateBalance = result.rows[0].balance + Number(amount)
            const queryUpdate = 'UPDATE balances SET balance = $1 WHERE "UserId" = $2'
            await db.query(queryUpdate, [updateBalance, userId])

            const date = Date.now().toString()
            const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

            const invoice = `INV-${date}-${randomNumber}`

            const queryTransaction = 'INSERT INTO transactions (user_id, invoice_number, transaction_type, description, total_amount, created_on) VALUES ($1, $2, $3, $4, $5, $6)'
            await db.query(queryTransaction, [userId, invoice, "TOPUP", "Top Up balance", amount, new Date()])

            res.status(200).json({ status: 0, message: "Top Up Balance berhasil", data: { balance: updateBalance } })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async transaction(req, res, next) {
        try {
            const { service_code } = req.body
            const userId = req.user.id

            if (!service_code) {
                throw { name: "Parameter service_code harus di isi" }
            }

            const queryService = 'SELECT * FROM services WHERE service_code = $1'
            const result = await db.query(queryService, [service_code])

            if (result.rows.length === 0) throw { name: "Service atau Layanan tidak ditemukan" }

            console.log(result.rows);

            const balance = await getBalance(userId)

            const date = Date.now().toString()
            const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

            const invoice = `INV-${date}-${randomNumber}`
            const service_id = result.rows[0].id
            const amount = result.rows[0].service_tariff
            const service_name = result.rows[0].service_name

            if (amount > balance) throw { name: "Saldo tidak mencukupi" }

            const saldo = balance - amount

            const queryTransaction = 'INSERT INTO transactions (user_id, service_id, invoice_number, transaction_type, description, total_amount, created_on) VALUES ($1, $2, $3, $4, $5, $6, $7)'

            await db.query(queryTransaction, [userId, service_id, invoice, "PAYMENT", "", amount, new Date()])

            const queryUpdate = 'UPDATE balances SET balance = $1 WHERE "UserId" = $2'

            await db.query(queryUpdate, [saldo, userId])

            res.status(201).json({
                status: 0,
                message: "Transaksi berhasil",
                data: {
                    invoice_number: invoice,
                    service_code,
                    service_name,
                    transaction_type: "PAYMENT",
                    total_amount: amount,
                    created_on: new Date()
                }
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}

module.exports = UserController