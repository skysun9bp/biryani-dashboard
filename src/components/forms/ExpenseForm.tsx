import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.number().min(2020, 'Year must be 2020 or later').max(2030, 'Year must be 2030 or earlier'),
  costType: z.string().min(1, 'Cost type is required'),
  expenseType: z.string().optional(),
  itemVendor: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  initialData?: Partial<ExpenseFormData>;
  isEditing?: boolean;
  costTypes?: string[];
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const currentYear = new Date().getFullYear();

// Common cost types
const defaultCostTypes = [
  'Food & Beverage',
  'Supplies & Equipment',
  'Utilities',
  'Rent & Lease',
  'Insurance',
  'Marketing & Advertising',
  'Professional Services',
  'Maintenance & Repairs',
  'Transportation',
  'Office & Admin',
  'Other'
];

export default function ExpenseForm({ 
  onSubmit, 
  initialData, 
  isEditing = false, 
  costTypes = defaultCostTypes 
}: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [customCostType, setCustomCostType] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      month: initialData?.month || months[new Date().getMonth()],
      year: initialData?.year || currentYear,
      costType: initialData?.costType || '',
      expenseType: initialData?.expenseType || '',
      itemVendor: initialData?.itemVendor || '',
      amount: initialData?.amount || 0,
    }
  });

  const watchedCostType = watch('costType');

  const onFormSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      await onSubmit(data);
      setSubmitMessage('Expense entry saved successfully!');
      if (!isEditing) {
        reset();
      }
    } catch (error) {
      setSubmitMessage('Error saving expense entry. Please try again.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomCostTypeChange = (value: string) => {
    setCustomCostType(value);
    if (value) {
      setValue('costType', value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Expense Entry' : 'Add Expense Entry'}
      </h2>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Date and Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month *
            </label>
            <select
              {...register('month')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            {errors.month && (
              <p className="text-red-500 text-sm mt-1">{errors.month.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year *
            </label>
            <input
              type="number"
              {...register('year', { valueAsNumber: true })}
              min="2020"
              max="2030"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
            )}
          </div>
        </div>

        {/* Cost Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Type *
          </label>
          <div className="space-y-2">
            <select
              {...register('costType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setCustomCostType('');
                } else {
                  setCustomCostType('');
                }
              }}
            >
              <option value="">Select a cost type</option>
              {costTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="custom">+ Add Custom Cost Type</option>
            </select>
            
            {watchedCostType === 'custom' && (
              <input
                type="text"
                value={customCostType}
                onChange={(e) => handleCustomCostTypeChange(e.target.value)}
                placeholder="Enter custom cost type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          {errors.costType && (
            <p className="text-red-500 text-sm mt-1">{errors.costType.message}</p>
          )}
        </div>

        {/* Expense Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expense Type (Optional)
          </label>
          <input
            type="text"
            {...register('expenseType')}
            placeholder="e.g., Raw Materials, Packaging, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.expenseType && (
            <p className="text-red-500 text-sm mt-1">{errors.expenseType.message}</p>
          )}
        </div>

        {/* Item/Vendor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item/Vendor (Optional)
          </label>
          <input
            type="text"
            {...register('itemVendor')}
            placeholder="e.g., Supplier name, item description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.itemVendor && (
            <p className="text-red-500 text-sm mt-1">{errors.itemVendor.message}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Submit Message */}
        {submitMessage && (
          <div className={`p-3 rounded-md ${
            submitMessage.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {submitMessage}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Entry' : 'Save Entry')}
          </button>
        </div>
      </form>
    </div>
  );
}
