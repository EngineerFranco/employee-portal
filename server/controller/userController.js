import { getUser, postUser, saveRefreshToken } from "../model/userModel.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "../config/dotenv.js";
import { v4 as uuidv4 } from 'uuid'; // For generating unique refresh tokens
import { pool } from "../config/db.js";

// Sign-up controller remains the same
export const signUpController = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashPass = bcrypt.hashSync(password, 10);

        const savedUser = await postUser(username, email, hashPass);
        
        res.status(201).json({
            message: "Sign up successfully",
            success: true,
            data: savedUser,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            message: error.message,
            success: false,
            data: []
        });
    }
};

// Sign-in controller with refresh token implementation
export const signInController = async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await getUser(email);
        
        if (!users || users.length === 0) {
            return res.status(404).json({
                message: `No users found`,
                success: false,
                data: email,
            });
        }

        const checkPassword = bcrypt.compareSync(password, users[0].password);
        if (!checkPassword) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
                data: [],
            });
        }

        const payload = {
            userId: users[0].id,
            role: users[0].role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Save refresh token in the database
        const refreshToken = await saveRefreshToken(users[0].id);

        // Set the access token in a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            maxAge: 3600000,
        });

        const data = {
            username: users[0].username,
            email: users[0].email,
            role: users[0].role,
            refreshToken: refreshToken 
        };

        res.status(200).json({
            message: "Sign in successfully",
            success: true,
            data: data,
        });
    } catch (error) {
        console.error("Error retrieving users:", error);
        res.status(500).json({
            message: error.message,
            success: false,
            data: []
        });
    }
};


// Refresh access token logic
export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is required" });
    }

    try {
        // Validate the refresh token in the database
        const query = `SELECT * FROM refresh_tokens WHERE refresh_token = $1 AND is_valid = TRUE AND expires_at > NOW()`;
        const result = await pool.query(query, [refreshToken]);

        if (result.rows.length === 0) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const userId = result.rows[0].user_id;
        const payload = { userId: userId };
        const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error("Error refreshing access token:", error);
        res.status(500).json({
            message: error.message,
            success: false,
            data: []
        });
    }
};

// Logout controller logic
export const logoutController = async (req, res) => {
    const { refreshToken } = req.body; 

    try {
        await pool.query(
            `UPDATE refresh_tokens SET is_valid = FALSE WHERE refresh_token = $1`,
            [refreshToken]
        );

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({
            message: error.message,
            success: false,
            data: []
        });
    }
};
