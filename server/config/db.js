import pkg from 'pg';

import { LOCAL_DB_URL, NODE_ENV, PROD_DB_EXT_URL } from './dotenv.js';


const { Pool } = pkg;
const connectionString = NODE_ENV === 'production' ? PROD_DB_EXT_URL : LOCAL_DB_URL;
export const pool = new Pool({
    connectionString,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Error connecting to PostgreSQL database:', err);
});

