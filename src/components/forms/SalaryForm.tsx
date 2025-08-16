import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const salarySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.number().min(2020, 'Year must be 2020 or later').max(2030, 'Year must be 2030 or earlier'),
  resourceName: z.string().min(1, 'Employee name is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  actualPaidDate: z.string().optional(),
});

type SalaryFormData = z.infer<typeof salarySchema>;

interface SalaryFormProps {
  onSubmit: (data: SalaryFormData) => Promise<void>;
  initialData?: Partial<SalaryFormData>;
  isEditing?: boolean;
  resourceNames?: string[];
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const currentYear = new Date().getFullYear();

export default function SalaryForm({ 
  onSubmit, 
  initialData, 
  isEditing = false, 
  resourceNames = [] 
}: SalaryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [customResourceName, setCustomResourceName] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      month: initialData?.month || months[new Date().getMonth()],
      year: initialData?.year || currentYear,
      resourceName: initialData?.resourceName || '',
      amount: initialData?.amount || 0,
      actualPaidDate: initialData?.actualPaidDate || '',
    }
  });

  const watchedResourceName = watch('resourceName');

  const onFormSubmit = async (data: SalaryFormData) => {
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      await onSubmit(data);
      setSubmitMessage('Salary entry saved successfully!');
      if (!isEditing) {
        reset();
      }
    } catch (error) {
      setSubmitMessage('Error saving salary entry. Please try again.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomResourceNameChange = (value: string) => {
    setCustomResourceName(value);
    if (value) {
      setValue('resourceName', value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Salary Entry' : 'Add Salary Entry'}
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

        {/* Employee Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employee Name *
          </label>
          <div className="space-y-2">
            {resourceNames.length > 0 ? (
              <select
                {...register('resourceName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setCustomResourceName('');
                  } else {
                    setCustomResourceName('');
                  }
                }}
              >
                <option value="">Select an employee</option>
                {resourceNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
                <option value="custom">+ Add New Employee</option>
              </select>
            ) : (
              <input
                type="text"
                {...register('resourceName')}
                placeholder="Enter employee name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {watchedResourceName === 'custom' && (
              <input
                type="text"
                value={customResourceName}
                onChange={(e) => handleCustomResourceNameChange(e.target.value)}
                placeholder="Enter new employee name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          {errors.resourceName && (
            <p className="text-red-500 text-sm mt-1">{errors.resourceName.message}</p>
          )}
        </div>

        {/* Salary Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary Amount *
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

        {/* Actual Paid Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actual Paid Date (Optional)
          </label>
          <input
            type="date"
            {...register('actualPaidDate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave blank if payment date is the same as the entry date
          </p>
          {errors.actualPaidDate && (
            <p className="text-red-500 text-sm mt-1">{errors.actualPaidDate.message}</p>
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
