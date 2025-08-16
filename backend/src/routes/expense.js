const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all expense entries with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { year, month, costType, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (year) where.year = parseInt(year);
    if (month) where.month = month;
    if (costType) where.costType = costType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [entries, total] = await Promise.all([
      prisma.expenseEntry.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.expenseEntry.count({ where })
    ]);

    res.json({
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get expense entries error:', error);
    res.status(500).json({ error: 'Failed to fetch expense entries' });
  }
});

// Get expense entry by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await prisma.expenseEntry.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!entry) {
      return res.status(404).json({ error: 'Expense entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Get expense entry error:', error);
    res.status(500).json({ error: 'Failed to fetch expense entry' });
  }
});

// Create new expense entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      date,
      month,
      year,
      costType,
      expenseType,
      itemVendor,
      amount
    } = req.body;

    const entry = await prisma.expenseEntry.create({
      data: {
        date: new Date(date),
        month,
        year: parseInt(year),
        costType,
        expenseType,
        itemVendor,
        amount: parseFloat(amount),
        createdBy: req.user.id
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Expense entry created successfully',
      entry
    });
  } catch (error) {
    console.error('Create expense entry error:', error);
    res.status(500).json({ error: 'Failed to create expense entry' });
  }
});

// Update expense entry
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove createdBy from update data
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Convert numeric fields
    if (updateData.amount !== undefined) {
      updateData.amount = parseFloat(updateData.amount);
    }

    if (updateData.year !== undefined) {
      updateData.year = parseInt(updateData.year);
    }

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const entry = await prisma.expenseEntry.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      message: 'Expense entry updated successfully',
      entry
    });
  } catch (error) {
    console.error('Update expense entry error:', error);
    res.status(500).json({ error: 'Failed to update expense entry' });
  }
});

// Get expense categories
router.get('/categories/cost-types', authenticateToken, async (req, res) => {
  try {
    const costTypes = await prisma.expenseEntry.findMany({
      select: { costType: true },
      distinct: ['costType']
    });

    res.json(costTypes.map(item => item.costType));
  } catch (error) {
    console.error('Get cost types error:', error);
    res.status(500).json({ error: 'Failed to fetch cost types' });
  }
});

// Delete expense entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.expenseEntry.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Expense entry deleted successfully' });
  } catch (error) {
    console.error('Delete expense entry error:', error);
    res.status(500).json({ error: 'Failed to delete expense entry' });
  }
});

module.exports = router;


