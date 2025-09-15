import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import api from '../utils/api';
import { Store, User } from '../types';

const schema = yup.object({
  name: yup.string().min(1, 'Store name is required').max(255, 'Store name must not exceed 255 characters').required('Store name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: yup.string().min(1, 'Address is required').max(400, 'Address must not exceed 400 characters').required('Address is required'),
  ownerEmail: yup.string().email('Invalid owner email').required('Owner email is required'),
});

type FormData = yup.InferType<typeof schema>;

interface EditStoreModalProps {
  store: Store;
  onClose: () => void;
  onSuccess: () => void;
}

const EditStoreModal: React.FC<EditStoreModalProps> = ({ store, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ownerId, setOwnerId] = useState<number | undefined>(store.owner_id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: store.name,
      email: store.email || '',
      address: store.address,
      ownerEmail: '',
    },
  });

  // Fetch and set initial owner email for editing
  React.useEffect(() => {
    async function fetchOwnerEmail() {
      if (store.owner_id) {
        try {
          const res = await api.get(`/admin/users?role=store_owner`);
          const owners: User[] = res.data;
          const owner = owners.find(u => u.id === store.owner_id);
          if (owner) {
            setValue('ownerEmail', owner.email);
            setOwnerId(owner.id);
          }
        } catch {
          setValue('ownerEmail', '');
        }
      } else {
        setValue('ownerEmail', '');
      }
    }
    fetchOwnerEmail();
  }, [store.owner_id, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Update the store's owner by email if changed
      let newOwnerId = ownerId;
      if (data.ownerEmail) {
        const res = await api.get(`/admin/users?role=store_owner&search=${encodeURIComponent(data.ownerEmail)}`);
        const owners: User[] = res.data;
        const found = owners.find(u => u.email === data.ownerEmail);
        if (found) {
          newOwnerId = found.id;
        } else {
          // Optionally, create a new store owner user here if not found
          toast.error('Store owner not found with this email');
          setIsLoading(false);
          return;
        }
      }
      await api.put(`/admin/stores/${store.id}`, {
        name: data.name,
        email: data.email,
        address: data.address,
        owner_id: newOwnerId,
      });
      toast.success('Store updated successfully!');
      onSuccess();
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        // @ts-expect-error: error type is unknown, may have response property from Axios
        toast.error(error.response?.data?.message || 'Failed to update store');
      } else {
        toast.error('Failed to update store');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Store</h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              {...register('name')}
              className={`block w-full rounded-lg border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`block w-full rounded-lg border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              {...register('address')}
              className={`block w-full rounded-lg border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 ${errors.address ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
            <input
              type="email"
              {...register('ownerEmail')}
              className={`block w-full rounded-lg border border-gray-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 ${errors.ownerEmail ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.ownerEmail && <p className="text-red-500 text-xs mt-1">{errors.ownerEmail.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStoreModal;