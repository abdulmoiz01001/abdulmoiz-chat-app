import express from 'express';
import { login, signup , getUserInfo , updateProfile , addProfileImage , deleteProfileImage } from '../controllers/AuthControllers.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import multer from "multer";
const upload = multer({ dest: 'uploads/profiles' });
const authRouter = express.Router();

authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.get('/user-info', verifyToken , getUserInfo )
authRouter.post('/update-profile', verifyToken , updateProfile );
authRouter.post('/add-profile-image', verifyToken , upload.single("profile-image") , addProfileImage );   
authRouter.delete('/delete-profile-image', verifyToken , deleteProfileImage ); 

export default authRouter;