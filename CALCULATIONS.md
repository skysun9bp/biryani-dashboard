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
Net Profit = Total Revenue - Total Expenses - Total Salaries - CC Fees - Commission Fees
```

### Where:
- **Total Revenue** = Sum of: Card, DD, UE, GH, CN, Catering, Other Cash, Foodja, Zelle, EzCater, Relish, waiter.com, Cash in Report
- **Total Expenses** = Sum of all amounts from the "Expenses" sheet
- **Total Salaries** = Sum of all amounts from the "Salaries" sheet
- **CC Fees** = Sum of "CC Fees" column from the "Net Sale" sheet (credit card processing fees)
- **Commission Fees** = Sum of: DD Fees, UE Fees, GH Fees, Foodja Fees, EzCater Fees, Relish Fees (3rd party delivery commissions)

## Expected Expense Categories

The dashboard is configured to track these expense categories from the "Expenses" sheet:

### Primary Expense Categories:
- **Maintenance** - Building and equipment maintenance costs
- **Marketing** - Advertising and promotional expenses
- **Automobile** - Vehicle-related expenses
- **Equipment** - Kitchen and business equipment costs
- **Insurance** - Business insurance premiums
- **Sales Tax & CPA** - Tax and accounting services
- **Payroll Other taxes** - Additional payroll taxes
- **Rent** - Property and equipment rental costs
- **Utilities** - Electricity, water, gas, internet, etc.
- **Misc** - Miscellaneous expenses
- **Bank Fees** - Banking and transaction fees
- **LLC Fees** - Business registration and compliance fees
- **Travel** - Business travel expenses
- **Food costs** - Raw materials and food supplies

### Additional Categories:
- **Salaries** - Employee salaries (from separate "Salaries" sheet)

## Expense Analytics Features

### Data Processing:
- **Sorting**: Expenses are sorted by amount (highest to lowest)
- **Categorization**: Grouped by "Cost Type" from the Expenses sheet
- **Salary Inclusion**: Salaries are added as a separate category
- **Validation**: Dashboard checks for missing expected categories

### Visual Features:
- **Pie Chart**: Shows expense breakdown by category
- **Bar Chart**: Compares expense amounts across categories
- **Detailed List**: Clickable expense items for drill-down
- **Missing Categories Warning**: Alerts when expected categories are not found

## Key Differences

| Aspect | Net Income | Net Profit |
|--------|------------|------------|
| **Source** | Revenue sheet columns with "2" suffix | Revenue - Expenses - Salaries |
| **Includes** | Sales Tax (needs deduction) | True operational profit |
| **Calculation** | Direct from revenue columns | Revenue minus all costs |
| **Use Case** | Revenue analysis | Overall profitability |

## Summary

- **Net Income**: Revenue-based calculation (includes tax)
- **Net Profit**: True profitability after all costs including CC Fees and Commission Fees
- **Expenses**: Includes all operational expenses, salaries, CC Fees, and Commission Fees
- **Categories**: 15 primary expense categories + salaries + CC Fees + Commission Fees
- **Sorting**: Expenses are sorted by amount (highest to lowest)
- **Validation**: Dashboard monitors for missing expense categories
