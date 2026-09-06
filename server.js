require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

const app = express();

app.use(cors({
  origin: "*"
}))
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Expense Tracker API is running' });
});
app.get('/', (req, res) => {
  res.send('API is running... MongoDB Connected 🚀');
});
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});