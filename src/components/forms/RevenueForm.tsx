import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const revenueSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.number().min(2020, 'Year must be 2020 or later').max(2030, 'Year must be 2030 or earlier'),
  cashInReport: z.number().min(0, 'Amount must be positive').optional(),
  card: z.number().min(0, 'Amount must be positive').optional(),
  dd: z.number().min(0, 'Amount must be positive').optional(),
  ue: z.number().min(0, 'Amount must be positive').optional(),
  gh: z.number().min(0, 'Amount must be positive').optional(),
  cn: z.number().min(0, 'Amount must be positive').optional(),
  catering: z.number().min(0, 'Amount must be positive').optional(),
  otherCash: z.number().min(0, 'Amount must be positive').optional(),
  foodja: z.number().min(0, 'Amount must be positive').optional(),
  zelle: z.number().min(0, 'Amount must be positive').optional(),
  ezCater: z.number().min(0, 'Amount must be positive').optional(),
  relish: z.number().min(0, 'Amount must be positive').optional(),
  waiterCom: z.number().min(0, 'Amount must be positive').optional(),
  ccFees: z.number().min(0, 'Amount must be positive').optional(),
  ddFees: z.number().min(0, 'Amount must be positive').optional(),
  ueFees: z.number().min(0, 'Amount must be positive').optional(),
  ghFees: z.number().min(0, 'Amount must be positive').optional(),
  foodjaFees: z.number().min(0, 'Amount must be positive').optional(),
  ezCaterFees: z.number().min(0, 'Amount must be positive').optional(),
  relishFees: z.number().min(0, 'Amount must be positive').optional(),
});

type RevenueFormData = z.infer<typeof revenueSchema>;

interface RevenueFormProps {
  onSubmit: (data: RevenueFormData) => Promise<void>;
  initialData?: Partial<RevenueFormData>;
  isEditing?: boolean;
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const currentYear = new Date().getFullYear();

export default function RevenueForm({ onSubmit, initialData, isEditing = false }: RevenueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<RevenueFormData>({
    resolver: zodResolver(revenueSchema),
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      month: initialData?.month || months[new Date().getMonth()],
      year: initialData?.year || currentYear,
      cashInReport: initialData?.cashInReport || 0,
      card: initialData?.card || 0,
      dd: initialData?.dd || 0,
      ue: initialData?.ue || 0,
      gh: initialData?.gh || 0,
      cn: initialData?.cn || 0,
      catering: initialData?.catering || 0,
      otherCash: initialData?.otherCash || 0,
      foodja: initialData?.foodja || 0,
      zelle: initialData?.zelle || 0,
      ezCater: initialData?.ezCater || 0,
      relish: initialData?.relish || 0,
      waiterCom: initialData?.waiterCom || 0,
      ccFees: initialData?.ccFees || 0,
      ddFees: initialData?.ddFees || 0,
      ueFees: initialData?.ueFees || 0,
      ghFees: initialData?.ghFees || 0,
      foodjaFees: initialData?.foodjaFees || 0,
      ezCaterFees: initialData?.ezCaterFees || 0,
      relishFees: initialData?.relishFees || 0,
    }
  });

  const watchedValues = watch();

  const calculateTotalRevenue = () => {
    return (watchedValues.cashInReport || 0) + (watchedValues.card || 0) + 
           (watchedValues.dd || 0) + (watchedValues.ue || 0) + (watchedValues.gh || 0) + 
           (watchedValues.cn || 0) + (watchedValues.catering || 0) + (watchedValues.otherCash || 0) + 
           (watchedValues.foodja || 0) + (watchedValues.zelle || 0) + (watchedValues.ezCater || 0) + 
           (watchedValues.relish || 0) + (watchedValues.waiterCom || 0);
  };

  const calculateTotalFees = () => {
    return (watchedValues.ccFees || 0) + (watchedValues.ddFees || 0) + 
           (watchedValues.ueFees || 0) + (watchedValues.ghFees || 0) + 
           (watchedValues.foodjaFees || 0) + (watchedValues.ezCaterFees || 0) + 
           (watchedValues.relishFees || 0);
  };

  const onFormSubmit = async (data: RevenueFormData) => {
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      await onSubmit(data);
      setSubmitMessage('Revenue entry saved successfully!');
      if (!isEditing) {
        reset();
      }
    } catch (error) {
      setSubmitMessage('Error saving revenue entry. Please try again.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Revenue Entry' : 'Add Revenue Entry'}
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

        {/* Revenue Sources */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash in Report
              </label>
              <input
                type="number"
                step="0.01"
                {...register('cashInReport', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card
              </label>
              <input
                type="number"
                step="0.01"
                {...register('card', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DoorDash
              </label>
              <input
                type="number"
                step="0.01"
                {...register('dd', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uber Eats
              </label>
              <input
                type="number"
                step="0.01"
                {...register('ue', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GrubHub
              </label>
              <input
                type="number"
                step="0.01"
                {...register('gh', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ChowNow
              </label>
              <input
                type="number"
                step="0.01"
                {...register('cn', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catering
              </label>
              <input
                type="number"
                step="0.01"
                {...register('catering', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Cash
              </label>
              <input
                type="number"
                step="0.01"
                {...register('otherCash', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foodja
              </label>
              <input
                type="number"
                step="0.01"
                {...register('foodja', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zelle
              </label>
              <input
                type="number"
                step="0.01"
                {...register('zelle', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EzCater
              </label>
              <input
                type="number"
                step="0.01"
                {...register('ezCater', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relish
              </label>
              <input
                type="number"
                step="0.01"
                {...register('relish', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waiter.com
              </label>
              <input
                type="number"
                step="0.01"
                {...register('waiterCom', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fees & Commissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Card Fees
              </label>
              <input
                type="number"
                step="0.01"
                {...register('ccFees', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DoorDash Fees
              </label>
              <input
                type="number"
                step="0.01"
                {...register('ddFees', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uber Eats Fees
              </label>
              <input
                type="number"
                step="0.01"
                {...register('ueFees', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GrubHub Fees
              </label>
              <input
                type="number"
                step="0.01"
                {...register('ghFees', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foodja Fees
              </label>
              <input
                type="number"
                step="0.01"
                {...register('foodjaFees', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EzCater Fees
              </label>
              <input
                type="number"
                step="0.01"
                {...register('ezCaterFees', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relish Fees
              </label>
              <input
                type="number"
                step="0.01"
                {...register('relishFees', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${calculateTotalRevenue().toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-red-600">
                ${calculateTotalFees().toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Net Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(calculateTotalRevenue() - calculateTotalFees()).toFixed(2)}
              </p>
            </div>
          </div>
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
