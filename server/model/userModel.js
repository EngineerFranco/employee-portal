import { pool } from "../config/db.js";
import { v4 as uuidv4 } from 'uuid';

// Get user by email
export const getUser = async (email) => {
    try {
        const query = `SELECT * FROM users WHERE email = $1`;
        const user = await pool.query(query, [email]);
        return user.rows;
    } catch (error) {
        console.error("Error fetching user:", error.message || error);
        throw new Error(error.message || error);
    }
};

// Create a new user and generate a refresh token
export const postUser = async (username, email, password) => {
    try {
        const checkQuery = `SELECT * FROM users WHERE email = $1`;
        const existingUser = await pool.query(checkQuery, [email]);

        if (existingUser.rows.length > 0) {
            throw new Error(`User with this email already exists`);
        }

        const result = await pool.query(
            `INSERT INTO users (username, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, created_at, updated_at`,
            [username, email, password]
        );

        const newUser = result.rows[0];
        return newUser;
    } catch (error) {
        console.error("Error creating user:", error.message || error);
        throw new Error(error.message || error);
    }
};

// Generate and save refresh token for a user
export const saveRefreshToken = async (userId) => {
    const refreshToken = uuidv4(); // Generate a unique refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days expiration

    try {
        await pool.query(
            `INSERT INTO refresh_tokens (user_id, refresh_token, expires_at)
             VALUES ($1, $2, $3)`,
            [userId, refreshToken, expiresAt]
        );

        return refreshToken;
    } catch (error) {
        console.error("Error saving refresh token:", error.message || error);
        throw new Error(error.message || error);
    }
};

// Invalidate refresh tokens when the user changes their password
export const invalidateRefreshTokens = async (userId) => {
    await pool.query(
        `UPDATE refresh_tokens SET is_valid = FALSE WHERE user_id = $1`,
        [userId]
    );
};
