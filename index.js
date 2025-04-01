import express from 'express'
import admin from 'firebase-admin'
import cors from 'cors'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// const serviceAccount = require('./eclyra-50711-firebase-adminsdk-fbsvc-fbc65cb015.json');
import { ErrorHandler } from './Middlewares/ErrorHandler.js'
import cookieParser from 'cookie-parser'
import { getFirestore } from "firebase-admin/firestore";

import { config } from 'dotenv';
config({
    path:'./.env',
})

const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
}

admin.initializeApp({
    credential: admin.credential.cert(
        serviceAccount
    ),
    databaseURL: 'https://eclyra-50711-default-rtdb.asia-southeast1.firebasedatabase.app/'
})

console.log("JBJB" + serviceAccount);

const app = express()
const PORT = process.env.PORT || 6000
export const db = getFirestore();

import UserRouter from './Routes/User.js'
import PickupRouter from './Routes/PickUp.js'

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
    extended: true,
}))
app.use(cookieParser())

app.use('/gdsc/v1/',UserRouter)
app.use('/gdsc/v1/',PickupRouter)

app.use(ErrorHandler)


app.listen(PORT, () => {
    console.log(serviceAccount)
    console.log(`App is listening at PORT - ${PORT}`)
})
