import { db } from "../index.js";
import { catchAsyncErrors } from "../Middlewares/CatchAsyncErrors.js";
import admin from 'firebase-admin'
import { CustomError } from "../Utils/CustomError.js";
import { sendEmail } from "../Utils/SendMail.js";

export const SchedulePickUp = catchAsyncErrors( async(req,res,next) => {
    const {sellerName, sellerEmail, pickUpLocation, pickUpDistrict, pickUpState, pickUpPin , estimatedWeight, scheduledDate, scheduledTime} = req.body

    if(!sellerName || !sellerEmail){
        return next(new CustomError('Cannot place your order right now, please try again later', 400))
    }

    if(!pickUpLocation || !estimatedWeight, !scheduledTime || !scheduledDate) {
        return next(new CustomError('Missing Fields', 400))
    }

    const newPickUp = await db.collection('PickUps').add({    
        sellerName,
        sellerEmail,
        pickUpLocation,
        pickUpPin,
        pickUpDistrict,
        pickUpState,
        estimatedWeight,
        status: 'pending',
        dealerId: null,
        orderedAt: admin.firestore.FieldValue.serverTimestamp(),
        expireAt: scheduledTime,
        scheduledTime,
        scheduledDate,
        oneTimePassword: null,
    });

    res.status(200).json({
        success: true,
        message: 'Your order is live now, it will be entertained soon',
        _id: newPickUp.id
    })
})


export const AcceptAPickUp = catchAsyncErrors( async(req,res,next) => {
    const { SellerId, SellerMail, DealerId, DealerName, id } = req.body

    if(!id || !DealerId || !SellerMail || !DealerName){
        return next(new CustomError('Cannot Accept the order right now, please try again later', 400))    
    } 

    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    const OTP = generateOTP()
    await db.collection('PickUps').doc(id).update({
        status: "Accepted",
        dealerId: DealerId,
        oneTimePassword: OTP,
    })

    const dealerRef = db.collection('Dealers').doc(DealerId);
    const dealerDoc = await dealerRef.get();

    if (dealerDoc.exists) {
      await dealerRef.update({
        UpcommingPickUps: admin.firestore.FieldValue.arrayUnion(id),
      });
    } else {
      await dealerRef.set({
        DealerId,
        UpcommingPickUps: [id],
      });
    }
    const message = `Your Order With id : ${id} has been accepted by ${DealerName}. Here is Your OTP : ${OTP}`
    await sendEmail(SellerMail, 'Order detail Eclyra', message)

    res.status(200).json({
        success: true,
        message: 'Order accepted'
    })
})


export const getAllPickUpsWithInState = catchAsyncErrors( async(req,res,next) => {
    const {state} = req.params

    if(!state) {
        return next(new CustomError('server error, cannot load the live pickups. Reload the page or try again later', 400))
    }

    const pickUps = await db.collection("PickUps").where('pickUpState', '==', state).get()

    const documentsArray = pickUps.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
    }));

    res.status(200).json({
        success: true,
        data: documentsArray
    })
})

export const getAllAcceptedPickUps = catchAsyncErrors(async (req, res, next) => {
    const { DealerId } = req.params;
  
    if (!DealerId) {
      return next(new CustomError('Cannot fetch details right now', 400));
    }
  
    const dealerRef = db.collection('Dealers').where('DealerId', '==', DealerId);
    const dealerSnapshot = await dealerRef.get();

    if (dealerSnapshot.empty) {
        console.log('No matching documents found.');
        return res.status(200).json({
            success: true,
            message: 'No matching documents found.',
            data: [],
        });
    }

    const documents = [];
    dealerSnapshot.forEach((doc) => {
    console.log(doc.data())
        documents.push({ id: doc.id, ...doc.data() });
    });     
    const data = documents[0] 
    console.log(data) 


    // Send the response with the fetched documents
    res.status(200).json({
    success: true,
    message: 'Documents fetched successfully.',
    data: data,
    });

});


export const getAllPickUpsWithInDistricts = catchAsyncErrors( async(req,res,next) => {
    const {district} = req.params

    if(!district) {
        return next(new CustomError('server error, cannot load the live pickups. Reload the page or try again later', 400))
    }

    const pickUps = await db.collection("PickUps").where('pickUpDistrict', '==', district).get()

    const documentsArray = pickUps.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
    }));

    res.status(200).json({
        success: true,
        data: documentsArray
    })
})


export const getAllSellerPickUps = catchAsyncErrors( async(req,res,next) => {
    const { SellerMail } = req.params;

    if(!SellerMail){
        return next(new CustomError('Cannot proceed your request right now, please try again later',500));
    }

    const pickUps = await db.collection("PickUps").where('sellerEmail', '==', SellerMail).get()

    const documents = []
    pickUps.forEach((doc) => {
        console.log(doc.data())
            documents.push({ id: doc.id, ...doc.data() });
        });  

    console.log(documents)

    res.status(200).json({
        success: true,
        data: documents
    })
})