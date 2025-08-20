const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard summary data
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const where = {};
    if (year) where.year = parseInt(year);
    if (month) where.month = month;

    // Get revenue data
    const revenueData = await prisma.revenueEntry.findMany({
      where,
      select: {
        cashInReport: true,
        card: true,
        dd: true,
        ue: true,
        gh: true,
        cn: true,
        catering: true,
        otherCash: true,
        foodja: true,
        zelle: true,
        ezCater: true,
        relish: true,
        waiterCom: true,
        ccFees: true,
        ddFees: true,
        ueFees: true,
        ghFees: true,
        foodjaFees: true,
        ezCaterFees: true,
        relishFees: true
      }
    });

    // Get expense data
    const expenseData = await prisma.expenseEntry.findMany({
      where,
      select: { 
        amount: true,
        costType: true,
        expenseType: true
      }
    });

    // Get salary data
    const salaryData = await prisma.salaryEntry.findMany({
      where,
      select: { amount: true }
    });

    // Calculate totals
    const totalRevenue = revenueData.reduce((sum, item) => {
      return sum + (item.cashInReport || 0) + (item.card || 0) + (item.dd || 0) + 
             (item.ue || 0) + (item.gh || 0) + (item.cn || 0) + (item.catering || 0) + 
             (item.otherCash || 0) + (item.foodja || 0) + (item.zelle || 0) + 
             (item.ezCater || 0) + (item.relish || 0) + (item.waiterCom || 0);
    }, 0);

    // Calculate expenses (excluding CC fees since they're shown separately)
    const totalExpenses = expenseData
      .filter(item => !(item.costType === 'CC Fees' && item.expenseType === 'Credit Card Processing'))
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalSalaries = salaryData.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Calculate CC fees from revenue entries only
    const totalCCFees = revenueData.reduce((sum, item) => sum + (item.ccFees || 0), 0);
    const totalCommissionFees = revenueData.reduce((sum, item) => {
      return sum + (item.ddFees || 0) + (item.ueFees || 0) + (item.ghFees || 0) + 
             (item.foodjaFees || 0) + (item.ezCaterFees || 0) + (item.relishFees || 0);
    }, 0);

    const totalCosts = totalExpenses + totalSalaries + totalCCFees + totalCommissionFees;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    res.json({
      revenue: Math.round(totalRevenue),
      expenses: Math.round(totalExpenses),
      salaries: Math.round(totalSalaries),
      ccFees: Math.round(totalCCFees),
      commissionFees: Math.round(totalCommissionFees),
      totalCosts: Math.round(totalCosts),
      netProfit: Math.round(netProfit),
      profitMargin: Math.round(profitMargin)
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// Get revenue analytics data
router.get('/revenue-analytics', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const where = {};
    if (year) where.year = parseInt(year);
    if (month) where.month = month;

    const revenueData = await prisma.revenueEntry.findMany({
      where,
      select: {
        date: true,
        cashInReport: true,
        card: true,
        dd: true,
        ue: true,
        gh: true,
        cn: true,
        catering: true,
        otherCash: true,
        foodja: true,
        zelle: true,
        ezCater: true,
        relish: true,
        waiterCom: true,
        ccFees: true,
        ddFees: true,
        ueFees: true,
        ghFees: true,
        foodjaFees: true,
        ezCaterFees: true,
        relishFees: true
      },
      orderBy: { date: 'asc' }
    });

    const processedData = revenueData.map(item => {
      const totalRevenue = (item.cashInReport || 0) + (item.card || 0) + (item.dd || 0) + 
                          (item.ue || 0) + (item.gh || 0) + (item.cn || 0) + (item.catering || 0) + 
                          (item.otherCash || 0) + (item.foodja || 0) + (item.zelle || 0) + 
                          (item.ezCater || 0) + (item.relish || 0) + (item.waiterCom || 0);

      const netIncome = (item.card || 0) + (item.dd || 0) + (item.ue || 0) + (item.gh || 0) + 
                       (item.catering || 0) + (item.otherCash || 0) + (item.foodja || 0) + 
                       (item.ezCater || 0) + (item.relish || 0) + (item.waiterCom || 0) + 
                       (item.cashInReport || 0);

      return {
        date: item.date,
        revenue: Math.round(totalRevenue),
        netIncome: Math.round(netIncome)
      };
    });

    res.json(processedData);
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// Get expense analytics data
router.get('/expense-analytics', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const where = {};
    if (year) where.year = parseInt(year);
    if (month) where.month = month;

    const expenseData = await prisma.expenseEntry.findMany({
      where,
      select: {
        costType: true,
        amount: true
      }
    });

    const salaryData = await prisma.salaryEntry.findMany({
      where,
      select: { amount: true }
    });

    // Group expenses by cost type
    const expenseByCostType = {};
    expenseData.forEach(item => {
      const costType = item.costType || 'Unknown';
      expenseByCostType[costType] = (expenseByCostType[costType] || 0) + (item.amount || 0);
    });

    // Add salaries
    const totalSalaries = salaryData.reduce((sum, item) => sum + (item.amount || 0), 0);
    if (totalSalaries > 0) {
      expenseByCostType['Salaries'] = totalSalaries;
    }

    // Convert to array and sort by amount
    const chartData = Object.entries(expenseByCostType)
      .map(([costType, amount]) => ({
        costType,
        amount: Math.round(amount),
        percentage: 0
      }))
      .sort((a, b) => b.amount - a.amount);

    const total = chartData.reduce((sum, item) => sum + item.amount, 0);
    const updatedData = chartData.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.amount / total) * 100) : 0
    }));

    res.json({
      data: updatedData,
      total: Math.round(total)
    });
  } catch (error) {
    console.error('Get expense analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch expense analytics' });
  }
});

// Get salary analytics data
router.get('/salary-analytics', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const where = {};
    if (year) where.year = parseInt(year);
    if (month) where.month = month;

    const salaryData = await prisma.salaryEntry.findMany({
      where,
      select: {
        resourceName: true,
        amount: true
      }
    });

    // Group salaries by resource name
    const salaryByEmployee = {};
    salaryData.forEach(item => {
      const employee = item.resourceName || 'Unknown';
      salaryByEmployee[employee] = (salaryByEmployee[employee] || 0) + (item.amount || 0);
    });

    const chartData = Object.entries(salaryByEmployee)
      .map(([employee, salary]) => ({
        employee,
        salary: Math.round(salary),
        percentage: 0
      }))
      .sort((a, b) => b.salary - a.salary);

    const total = chartData.reduce((sum, item) => sum + item.salary, 0);
    const avg = total / chartData.length;
    const updatedData = chartData.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.salary / total) * 100) : 0
    }));

    res.json({
      data: updatedData,
      total: Math.round(total),
      average: Math.round(avg),
      highestPaid: updatedData.length > 0 ? updatedData[0].employee : null
    });
  } catch (error) {
    console.error('Get salary analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch salary analytics' });
  }
});

module.exports = router;


