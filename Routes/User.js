import express from 'express';
import { RegisterUser }  from '../Controllers/UserControllers.js'
const router = express.Router()

router.route('/registeruser').post(RegisterUser)

export default router