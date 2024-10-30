import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET;
export const LOCAL_DB_URL = process.env.LOCAL_DB_URL;
export const PROD_DB_EXT_URL = process.env.PROD_DB_EXT_URL;
export const NODE_ENV = process.env.NODE_ENV
