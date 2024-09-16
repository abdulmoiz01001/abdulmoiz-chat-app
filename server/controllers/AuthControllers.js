import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs";
const maxAge = 3 * 24 * 60 * 60;

const createToken = (userEmail, userId) => {
    return jwt.sign({ userEmail, userId }, process.env.JWT_KEY, {
        expiresIn: maxAge
    });
}

export const signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Please fill all the fields" });
        }
        const user = await User.create({ email, password })
        res.cookie('jwt', createToken(user.email, user._id), {
            maxAge,
            secure: true, // Use secure cookies only in production (over HTTPS)
            sameSite: 'None', // Allows cross-site cookies, but requires 'secure: true'
        });

        return res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
            }
        })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Please fill all the fields" });
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        const auth = await compare(password, user.password);
        if (!auth) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        res.cookie('jwt', createToken(user.email, user._id), {
            maxAge,
            secure: true, // Use secure cookies only in production (over HTTPS)
            sameSite: 'None', // Allows cross-site cookies, but requires 'secure: true'
        });

        return res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color
            }
        })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


export const getUserInfo = async (req, res) => {
    try {
        console.log(req.userId)
        const userData = await User.findById(req.userId)
        if (!userData) {
            return res.status(400).send("User not found");
        }

        return res.status(200).json({

            id: userData._id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color

        })

    } catch (err) {
        return res.status(500).send("Server Error");
    }
}


export const updateProfile = async (req, res) => {
    try {
        const { userId } = req;
        console.log(userId)
        const { firstName, lastName, color } = req.body;
        console.log(firstName, lastName, color)
        console.log(req.body)
        if (!firstName || !lastName) {
            return res.status(400).send("First Name , Last Name and Color is required");
        }

        const userData = await User.findByIdAndUpdate(userId, {
            firstName, lastName, color, profileSetup: true
        },
            { new: true, runValidators: true }
        )

        return res.status(200).json({

            id: userData._id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color

        })

    } catch (err) {
        return res.status(500).send("Server Error");
    }
}


export const addProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).send("Image is required");
        }

        const date = Date.now();

        let fileName = "uploads/profiles/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);

        const updatedUser = await User.findByIdAndUpdate(req.userId, { image: fileName }, { new: true, runValidators: true });

        return res.status(200).json({

            image: updatedUser.image

        })

    } catch (err) {
        return res.status(500).send("Server Error");
    }
}


export const deleteProfileImage = async (req, res) => {
    try {
        const { userId } = req;
        
        const user = await User.findById(userId);

        if(!user){
            return res.status(400).send("User not found");
        }

        if(user.image){
            unlinkSync(user.image);
        
        }

        user.image = null;
        await user.save();

        return res.status(200).send("Profile image removed successfully.")



    } catch (err) {
        console.log(err)
        return res.status(500).send("Server Error");
    }
}

