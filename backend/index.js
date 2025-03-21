import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './database.sqlite';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDatabase();
    }
});

// Database Initialization Function
const initDatabase = () => {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    db.exec(schema, (err) => {
        if (err) {
            console.error('Error executing schema: ', err.message);
            return;
        }
        console.log('Database schema initialized.');
    });
};

// API Endpoints
app.post('/api/users', (req, res) => {
    const { email, password } = req.body;
    const insert = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    
    insert.run(email, password, function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            return res.status(400).json({ error: 'Invalid input' });
        }
        res.status(201).json({ userId: this.lastID, email, createdAt: new Date() });
    });
});

app.get('/api/users/:userId', (req, res) => {
    const { userId } = req.params;
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(row);
    });
});

// User Session Management Endpoints
app.post('/api/sessions', (req, res) => {
    const { email, password } = req.body;
    // Example matching logic, should be replaced with actual logic
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err || !row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Here we would generate a token for the session
        const sessionId = 'example-session-id'; // replace with real UUID
        res.status(200).json({ sessionId, token: 'example-jwt-token' });
    });
});

// Financial Data Management Endpoints
app.post('/api/financials', (req, res) => {
    const { userId, monthlyIncome, monthlyExpenses, loanAmount, interestRate, loanTerm, monthlyContribution, investmentDuration } = req.body;
    const insert = db.prepare('INSERT INTO financials (userId, monthlyIncome, monthlyExpenses, loanAmount, interestRate, loanTerm, monthlyContribution, investmentDuration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    insert.run(userId, monthlyIncome, monthlyExpenses, loanAmount, interestRate, loanTerm, monthlyContribution, investmentDuration, function (err) {
        if (err) {
            return res.status(400).json({ error: 'Invalid numeric input' });
        }
        res.status(201).json({ dataId: this.lastID, userId, createdAt: new Date() });
    });
});

app.get('/api/financials/:userId', (req, res) => {
    const { userId } = req.params;
    db.all('SELECT * FROM financials WHERE userId = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(404).json({ error: 'Records not found' });
        }
        res.json({ records: rows });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Server startup
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});