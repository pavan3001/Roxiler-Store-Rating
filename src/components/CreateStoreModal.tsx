import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import api from '../utils/api';

const schema = yup.object({
  name: yup
    .string()
    .min(1, 'Store name is required')
    .max(255, 'Store name must not exceed 255 characters')
    .required('Store name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: yup
    .string()
    .min(1, 'Address is required')
    .max(400, 'Address must not exceed 400 characters')
    .required('Address is required'),
  ownerEmail: yup.string().email('Invalid owner email').optional(),
});

type FormData = yup.InferType<typeof schema>;

interface CreateStoreModalProps {
  onClose: () => void;
  onSuccess: () => void;
  forOwner?: boolean; // if true, post to /stores (owner endpoint)
}

const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ onClose, onSuccess, forOwner = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    // resolver typing from yupResolver can be incompatible with strict generic inference in some TS setups
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
  const endpoint = forOwner ? '/stores' : '/admin/stores';
  await api.post(endpoint, data);
      toast.success('Store created successfully!');
      onSuccess();
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = error as any;
      toast.error(err?.response?.data?.message || 'Failed to create store');
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center p-4 z-50 modal-overlay-light">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Create New Store</h2>
          <button
            onClick={onClose}
            aria-label="Close create store"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter store name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter store email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
            <textarea
              {...register('address')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Enter store address (max 400 characters)"
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
          </div>

          {!forOwner && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Owner Email (Optional)</label>
              <input
                {...register('ownerEmail')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter store owner email (must be a store_owner user)"
              />
              {errors.ownerEmail && <p className="mt-1 text-sm text-red-600">{errors.ownerEmail.message}</p>}
              <p className="mt-1 text-xs text-gray-500">Leave empty if no specific owner, or enter email of an existing store owner user</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStoreModal;