const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all salary entries with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { year, month, resourceName, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (year) where.year = parseInt(year);
    if (month) where.month = month;
    if (resourceName) where.resourceName = resourceName;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [entries, total] = await Promise.all([
      prisma.salaryEntry.findMany({
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
      prisma.salaryEntry.count({ where })
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
    console.error('Get salary entries error:', error);
    res.status(500).json({ error: 'Failed to fetch salary entries' });
  }
});

// Get salary entry by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await prisma.salaryEntry.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!entry) {
      return res.status(404).json({ error: 'Salary entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Get salary entry error:', error);
    res.status(500).json({ error: 'Failed to fetch salary entry' });
  }
});

// Create new salary entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      date,
      month,
      year,
      resourceName,
      amount,
      actualPaidDate
    } = req.body;

    const entry = await prisma.salaryEntry.create({
      data: {
        date: new Date(date),
        month,
        year: parseInt(year),
        resourceName,
        amount: parseFloat(amount),
        actualPaidDate: actualPaidDate ? new Date(actualPaidDate) : null,
        createdBy: req.user.id
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Salary entry created successfully',
      entry
    });
  } catch (error) {
    console.error('Create salary entry error:', error);
    res.status(500).json({ error: 'Failed to create salary entry' });
  }
});

// Update salary entry
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

    if (updateData.actualPaidDate) {
      updateData.actualPaidDate = new Date(updateData.actualPaidDate);
    }

    const entry = await prisma.salaryEntry.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      message: 'Salary entry updated successfully',
      entry
    });
  } catch (error) {
    console.error('Update salary entry error:', error);
    res.status(500).json({ error: 'Failed to update salary entry' });
  }
});

// Get resource names
router.get('/resources/names', authenticateToken, async (req, res) => {
  try {
    const resourceNames = await prisma.salaryEntry.findMany({
      select: { resourceName: true },
      distinct: ['resourceName']
    });

    res.json(resourceNames.map(item => item.resourceName));
  } catch (error) {
    console.error('Get resource names error:', error);
    res.status(500).json({ error: 'Failed to fetch resource names' });
  }
});

// Delete salary entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.salaryEntry.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Salary entry deleted successfully' });
  } catch (error) {
    console.error('Delete salary entry error:', error);
    res.status(500).json({ error: 'Failed to delete salary entry' });
  }
});

module.exports = router;


