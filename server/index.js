const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to read JSON data sent from the frontend

// Database Connection Setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// "Hello World" Test Route
app.get('/test-db', async (req, res) => {
    try {
        // This query asks the database for the current time
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: "Success! The Backend is talking to PostgreSQL.",
            databaseTime: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database connection failed!" });
    }
});

// 1. Create a New Account
app.post('/accounts', async (req, res) => {
    try {
        const { name, initial_balance } = req.body;
        
        // Generate a simple 10-digit account number (for demo purposes)
        const account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        const newAccount = await pool.query(
            "INSERT INTO accounts (name, account_number, balance) VALUES($1, $2, $3) RETURNING *",
            [name, account_number, initial_balance || 0]
        );

        res.json({
            message: "Account created successfully!",
            account: newAccount.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error while creating account" });
    }
});

// 2. Get All Accounts (To view existing details later)
app.get('/accounts', async (req, res) => {
    try {
        const allAccounts = await pool.query("SELECT * FROM accounts ORDER BY id DESC");
        res.json(allAccounts.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// 3. Handle Deposits and Withdrawals
// UPDATED: Handle Transactions AND Record them in history
app.post('/transactions', async (req, res) => {
    const { account_number, amount, type } = req.body;
    const numAmount = parseFloat(amount);

    try {
        await pool.query('BEGIN');

        const accountRes = await pool.query("SELECT balance FROM accounts WHERE account_number = $1", [account_number]);
        if (accountRes.rows.length === 0) return res.status(404).json({ error: "Account not found" });

        let newBalance = parseFloat(accountRes.rows[0].balance);
        if (type === 'deposit') newBalance += numAmount;
        else if (type === 'withdraw') {
            if (newBalance < numAmount) {
                await pool.query('ROLLBACK');
                return res.status(400).json({ error: "Insufficient funds" });
            }
            newBalance -= numAmount;
        }

        // 1. Update Balance
        await pool.query("UPDATE accounts SET balance = $1 WHERE account_number = $2", [newBalance, account_number]);

        // 2. Insert into Transaction History Table
        await pool.query(
            "INSERT INTO transactions (account_number, amount, type) VALUES ($1, $2, $3)",
            [account_number, numAmount, type]
        );

        await pool.query('COMMIT');
        res.json({ message: "Success" });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: "Transaction failed" });
    }
});

// NEW: Get Transaction History for a specific account
app.get('/transactions/:accNum', async (req, res) => {
    try {
        const history = await pool.query(
            "SELECT * FROM transactions WHERE account_number = $1 ORDER BY created_at DESC",
            [req.params.accNum]
        );
        res.json(history.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});