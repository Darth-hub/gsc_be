import { db } from "../index.js";
import { catchAsyncErrors } from "../Middlewares/CatchAsyncErrors.js";
import { CustomError } from "../Utils/CustomError.js";

export const createBlog = catchAsyncErrors( async(req,res,next) => {
    const {title, content, author} = req.body

    if(!title || !content || !author) {
        return next(new CustomError('Missing Fields', 400))
    }

    title.trim()
    content.trim()
    author.trim()

    if(title.length == 0){
        return next(new CustomError('Title is too short', 400))
    }
    if(content.length() < 15){
        return next(new CustomError('Content is too short', 400))
    }

    const newBlog = await db.collection('blogs').add({
        title,
        content,
        author,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
        success: true,
        message: 'Blog is successfully published'
    })
}) 