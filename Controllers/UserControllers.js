import admin from "firebase-admin"
import { CustomError } from "../Utils/CustomError.js"
import { catchAsyncErrors } from "../Middlewares/CatchAsyncErrors.js"

export const RegisterUser = catchAsyncErrors( async(req,res,next) => {
    const {name ,role ,email, password} = req.body;

    if(!name || !email || !password){
        return next(new CustomError("Missing Fields", 400));
    }

    const user = await admin.auth().createUser({
        displayName: name,
        email,
        password,
    });
    await admin.auth().setCustomUserClaims(user.uid, { role });
    const token = await admin.auth().createCustomToken(user.uid);
    
    const options = {
        expires: new Date(Date.now()+ 1000*60*60*24*15),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    }

    res.status(200).cookie("token",token,options).json({
        success:true,
        message: "User Registered Successfully",
    })
})
