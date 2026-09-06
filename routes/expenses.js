const express = require('express');
const Expense = require('../models/Expense');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const records = await Expense.find({ user: req.userId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { type, category, amount, note, date } = req.body;

    if (!type || !category || amount === undefined) {
      return res.status(400).json({ message: 'Type, category and amount are required' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    const record = await Expense.create({
      user: req.userId, type, category, amount, note, date: date || Date.now()
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const record = await Expense.findOne({ _id: req.params.id, user: req.userId });
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    await record.deleteOne();
    res.json({ message: 'Record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const records = await Expense.find({ user: req.userId });

    const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);

    const byCategory = {};
    records.filter(r => r.type === 'expense').forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.amount;
    });

    res.json({ totalIncome, totalExpense, remainingSavings: totalIncome - totalExpense, byCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

module.exports = router;