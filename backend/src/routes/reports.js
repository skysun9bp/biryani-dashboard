const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Get financial data for reports
router.get('/financial-data', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Build where clause
    const whereClause = {};
    if (year) {
      whereClause.year = parseInt(year);
    }
    if (month) {
      whereClause.month = month;
    }

    // Get revenue data
    const revenueData = await prisma.revenueEntry.findMany({
      where: whereClause,
      select: {
        date: true,
        month: true,
        year: true,
        cashInReport: true,
        card2: true,
        card: true,
        dd: true,
        ue: true,
        gh: true,
        cn: true,
        dd2: true,
        ue2: true,
        gh2: true,
        cn2: true,
        ddFees: true,
        ueFees: true,
        ghFees: true,
        catering: true,
        otherCash: true,
        foodja: true,
        foodja2: true,
        foodjaFees: true,
        zelle: true,
        relish: true,
        relish2: true,
        relishFees: true,
        ezCater: true,
        ezCater2: true,
        ezCaterFees: true,
        waiterCom: true,
        ccFees: true
      }
    });

    // Get expense data
    const expenseData = await prisma.expenseEntry.findMany({
      where: whereClause,
      select: {
        date: true,
        month: true,
        year: true,
        costType: true,
        expenseType: true,
        itemVendor: true,
        amount: true
      }
    });

    // Get salary data
    const salaryData = await prisma.salaryEntry.findMany({
      where: whereClause,
      select: {
        date: true,
        month: true,
        year: true,
        resourceName: true,
        amount: true,
        actualPaidDate: true
      }
    });

    // Process data for charts
    const financialData = processFinancialData(revenueData, expenseData, salaryData);
    const expenseBreakdown = processExpenseBreakdown(expenseData);
    const salaryBreakdown = processSalaryBreakdown(salaryData);
    const feeBreakdown = processFeeBreakdown(revenueData);

    res.json({
      financialData,
      expenseBreakdown,
      salaryBreakdown,
      feeBreakdown
    });

  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

// Process financial data for trends
function processFinancialData(revenueData, expenseData, salaryData) {
  const monthlyData = {};

  // Process revenue data
  revenueData.forEach(entry => {
    const key = `${entry.month}-${entry.year}`;
    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: entry.month,
        year: entry.year,
        revenue: 0,
        expenses: 0,
        salaries: 0,
        netProfit: 0,
        ccFees: 0,
        ddFees: 0,
        ueFees: 0,
        ghFees: 0,
        foodjaFees: 0,
        ezCaterFees: 0,
        relishFees: 0
      };
    }

    // Calculate total revenue
    monthlyData[key].revenue += 
      (entry.cashInReport || 0) +
      (entry.card || 0) +
      (entry.dd || 0) +
      (entry.ue || 0) +
      (entry.gh || 0) +
      (entry.cn || 0) +
      (entry.catering || 0) +
      (entry.otherCash || 0) +
      (entry.foodja || 0) +
      (entry.zelle || 0) +
      (entry.ezCater || 0) +
      (entry.relish || 0) +
      (entry.waiterCom || 0);

    // Round revenue to nearest dollar
    monthlyData[key].revenue = Math.round(monthlyData[key].revenue);

    // Add fees - calculate CC Fees dynamically as Card - Card2
    const ccFeesCalculation = Math.max(0, (entry.card || 0) - (entry.card2 || 0));
    console.log(`CC Fees calculation for ${entry.date}: Card=${entry.card || 0}, Card2=${entry.card2 || 0}, CC Fees=${ccFeesCalculation}`);
    monthlyData[key].ccFees += ccFeesCalculation;
    monthlyData[key].ddFees += (entry.ddFees || 0);
    monthlyData[key].ueFees += (entry.ueFees || 0);
    monthlyData[key].ghFees += (entry.ghFees || 0);
    monthlyData[key].foodjaFees += (entry.foodjaFees || 0);
    monthlyData[key].ezCaterFees += (entry.ezCaterFees || 0);
    monthlyData[key].relishFees += (entry.relishFees || 0);

    // Round all fees to nearest dollar
    monthlyData[key].ccFees = Math.round(monthlyData[key].ccFees);
    monthlyData[key].ddFees = Math.round(monthlyData[key].ddFees);
    monthlyData[key].ueFees = Math.round(monthlyData[key].ueFees);
    monthlyData[key].ghFees = Math.round(monthlyData[key].ghFees);
    monthlyData[key].foodjaFees = Math.round(monthlyData[key].foodjaFees);
    monthlyData[key].ezCaterFees = Math.round(monthlyData[key].ezCaterFees);
    monthlyData[key].relishFees = Math.round(monthlyData[key].relishFees);
  });

  // Process expense data
  expenseData.forEach(entry => {
    const key = `${entry.month}-${entry.year}`;
    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: entry.month,
        year: entry.year,
        revenue: 0,
        expenses: 0,
        salaries: 0,
        netProfit: 0,
        ccFees: 0,
        ddFees: 0,
        ueFees: 0,
        ghFees: 0,
        foodjaFees: 0,
        ezCaterFees: 0,
        relishFees: 0
      };
    }
    monthlyData[key].expenses += entry.amount || 0;
    // Round expenses to nearest dollar
    monthlyData[key].expenses = Math.round(monthlyData[key].expenses);
  });

  // Process salary data
  salaryData.forEach(entry => {
    const key = `${entry.month}-${entry.year}`;
    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: entry.month,
        year: entry.year,
        revenue: 0,
        expenses: 0,
        salaries: 0,
        netProfit: 0,
        ccFees: 0,
        ddFees: 0,
        ueFees: 0,
        ghFees: 0,
        foodjaFees: 0,
        ezCaterFees: 0,
        relishFees: 0
      };
    }
    monthlyData[key].salaries += entry.amount || 0;
    // Round salaries to nearest dollar
    monthlyData[key].salaries = Math.round(monthlyData[key].salaries);
  });

  // Calculate net profit and sort by date
  const result = Object.values(monthlyData).map(item => {
    // Calculate total commission fees (sum of all delivery platform fees)
    const totalCommissionFees = (item.ddFees || 0) + (item.ueFees || 0) + (item.ghFees || 0) + 
                               (item.foodjaFees || 0) + (item.ezCaterFees || 0) + (item.relishFees || 0);
    
    // Net profit = Revenue - (Expenses + Salaries + CC Fees + Commissions)
    const netProfit = item.revenue - item.expenses - item.salaries - item.ccFees - totalCommissionFees;
    
    return {
      ...item,
      revenue: Math.round(item.revenue),
      expenses: Math.round(item.expenses),
      salaries: Math.round(item.salaries),
      netProfit: Math.round(netProfit)
    };
  });

  // Sort by year and month
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  result.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  return result;
}

// Process expense breakdown
function processExpenseBreakdown(expenseData) {
  const breakdown = {};

  expenseData.forEach(entry => {
    const category = entry.costType || 'Other';
    if (!breakdown[category]) {
      breakdown[category] = 0;
    }
    breakdown[category] += entry.amount || 0;
  });

  const total = Object.values(breakdown).reduce((sum, amount) => sum + amount, 0);

  return Object.entries(breakdown).map(([category, amount]) => ({
    category,
    amount: Math.round(amount),
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);
}

// Process fee breakdown from revenue data
function processFeeBreakdown(revenueData) {
  const breakdown = {
    'Credit Card Fees': 0,
    'DD Fees': 0,
    'UE Fees': 0,
    'GH Fees': 0,
    'Foodja Fees': 0,
    'EzCater Fees': 0,
    'Relish Fees': 0
  };

  revenueData.forEach(entry => {
    breakdown['Credit Card Fees'] += Math.max(0, (entry.card || 0) - (entry.card2 || 0));
    breakdown['DD Fees'] += (entry.ddFees || 0);
    breakdown['UE Fees'] += (entry.ueFees || 0);
    breakdown['GH Fees'] += (entry.ghFees || 0);
    breakdown['Foodja Fees'] += (entry.foodjaFees || 0);
    breakdown['EzCater Fees'] += (entry.ezCaterFees || 0);
    breakdown['Relish Fees'] += (entry.relishFees || 0);
  });

  const total = Object.values(breakdown).reduce((sum, amount) => sum + amount, 0);

  return Object.entries(breakdown)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount),
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

// Process salary breakdown
function processSalaryBreakdown(salaryData) {
  const breakdown = {};

  salaryData.forEach(entry => {
    const employee = entry.resourceName || 'Unknown';
    if (!breakdown[employee]) {
      breakdown[employee] = 0;
    }
    breakdown[employee] += entry.amount || 0;
  });

  const total = Object.values(breakdown).reduce((sum, amount) => sum + amount, 0);

  return Object.entries(breakdown).map(([employee, amount]) => ({
    employee,
    amount: Math.round(amount),
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);
}

module.exports = router;
