# Financial Calculations Documentation

## Overview
This document explains how Net Profit and Net Income are calculated in the Biryani Dashboard.

## Net Income Calculation (Revenue Analytics Section)

**Net Income** is calculated in the Revenue Analytics section using specific columns from the "Net Sale" sheet:

### Formula:
```
Net Income = Card2 + DD2 + UE2 + GH2 + Catering + Other Cash + Foodja2 + EzCater2 + Relish2 + waiter.com2 + Cash in Report
```

### Columns Used:
- Card2
- DD2  
- UE2
- GH2
- Catering
- Other Cash
- Foodja2
- EzCater2
- Relish2
- waiter.com2
- Cash in Report

### Important Note:
Net Income includes Sales Tax that needs to be deducted for true profitability analysis.

## Net Profit Calculation (Summary Cards Section)

**Net Profit** is calculated in the Summary Cards section using a different approach:

### Formula:
```
Net Profit = Total Revenue - Total Expenses - Total Salaries
```

### Where:
- **Total Revenue** = Sum of: Card, DD, UE, GH, CN, Catering, Other Cash, Foodja, Zelle, EzCater, Relish, waiter.com, Cash in Report
- **Total Expenses** = Sum of all amounts from the "Expenses" sheet
- **Total Salaries** = Sum of all amounts from the "Salaries" sheet

## Key Differences

| Aspect | Net Income | Net Profit |
|--------|------------|------------|
| **Source** | Revenue sheet columns with "2" suffix | Revenue - Expenses - Salaries |
| **Includes** | Sales Tax (needs deduction) | True operational profit |
| **Calculation** | Direct from revenue columns | Revenue minus all costs |
| **Use Case** | Revenue analysis | Overall profitability |

## Expense Analytics Section

The Expense Analytics section now includes:
- All expenses from the "Expenses" sheet
- Salaries as a separate category
- Sorted by descending amount
- Shows percentage breakdown of total expenses

## Summary

- **Net Income**: Revenue-based calculation (includes tax)
- **Net Profit**: True profitability after all costs
- **Expenses**: Now includes both operational expenses and salaries
- **Sorting**: Expenses are sorted by amount (highest to lowest)
