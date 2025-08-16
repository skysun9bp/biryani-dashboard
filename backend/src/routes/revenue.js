const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all revenue entries with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { year, month, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (year) where.year = parseInt(year);
    if (month) where.month = month;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [entries, total] = await Promise.all([
      prisma.revenueEntry.findMany({
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
      prisma.revenueEntry.count({ where })
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
    console.error('Get revenue entries error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue entries' });
  }
});

// Get revenue entry by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await prisma.revenueEntry.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!entry) {
      return res.status(404).json({ error: 'Revenue entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Get revenue entry error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue entry' });
  }
});

// Create new revenue entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      date,
      month,
      year,
      cashInReport = 0,
      card = 0,
      dd = 0,
      ue = 0,
      gh = 0,
      cn = 0,
      catering = 0,
      otherCash = 0,
      foodja = 0,
      zelle = 0,
      ezCater = 0,
      relish = 0,
      waiterCom = 0,
      ccFees = 0,
      ddFees = 0,
      ueFees = 0,
      ghFees = 0,
      foodjaFees = 0,
      ezCaterFees = 0,
      relishFees = 0
    } = req.body;

    // Check if entry already exists for this date
    const existingEntry = await prisma.revenueEntry.findFirst({
      where: {
        date: new Date(date),
        year: parseInt(year),
        month
      }
    });

    if (existingEntry) {
      return res.status(400).json({ error: 'Revenue entry already exists for this date' });
    }

    const entry = await prisma.revenueEntry.create({
      data: {
        date: new Date(date),
        month,
        year: parseInt(year),
        cashInReport: parseFloat(cashInReport),
        card: parseFloat(card),
        dd: parseFloat(dd),
        ue: parseFloat(ue),
        gh: parseFloat(gh),
        cn: parseFloat(cn),
        catering: parseFloat(catering),
        otherCash: parseFloat(otherCash),
        foodja: parseFloat(foodja),
        zelle: parseFloat(zelle),
        ezCater: parseFloat(ezCater),
        relish: parseFloat(relish),
        waiterCom: parseFloat(waiterCom),
        ccFees: parseFloat(ccFees),
        ddFees: parseFloat(ddFees),
        ueFees: parseFloat(ueFees),
        ghFees: parseFloat(ghFees),
        foodjaFees: parseFloat(foodjaFees),
        ezCaterFees: parseFloat(ezCaterFees),
        relishFees: parseFloat(relishFees),
        createdBy: req.user.id
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Revenue entry created successfully',
      entry
    });
  } catch (error) {
    console.error('Create revenue entry error:', error);
    res.status(500).json({ error: 'Failed to create revenue entry' });
  }
});

// Update revenue entry
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove createdBy from update data
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Convert numeric fields
    const numericFields = [
      'cashInReport', 'card', 'dd', 'ue', 'gh', 'cn', 'catering', 'otherCash',
      'foodja', 'zelle', 'ezCater', 'relish', 'waiterCom', 'ccFees', 'ddFees',
      'ueFees', 'ghFees', 'foodjaFees', 'ezCaterFees', 'relishFees'
    ];

    numericFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = parseFloat(updateData[field]);
      }
    });

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    if (updateData.year) {
      updateData.year = parseInt(updateData.year);
    }

    const entry = await prisma.revenueEntry.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      message: 'Revenue entry updated successfully',
      entry
    });
  } catch (error) {
    console.error('Update revenue entry error:', error);
    res.status(500).json({ error: 'Failed to update revenue entry' });
  }
});

// Delete revenue entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.revenueEntry.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Revenue entry deleted successfully' });
  } catch (error) {
    console.error('Delete revenue entry error:', error);
    res.status(500).json({ error: 'Failed to delete revenue entry' });
  }
});

module.exports = router;


