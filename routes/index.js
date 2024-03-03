const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const authentication = require('../middlewares/authenticationUser')

router.post('/register', UserController.register)
router.post('/login', UserController.login)

router.use(authentication)

router.get('/balance', UserController.balance)

router.post('/topup', UserController.topup)

router.post('/transaction', UserController.transaction)


module.exports = router