import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User } from '../types';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface EditUserModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const schema = yup.object({
  name: yup.string().required('Name is required').max(60),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: yup.string().max(400).optional(),
  role: yup.mixed<'admin' | 'user' | 'store_owner'>().oneOf(['admin', 'user', 'store_owner']).required('Role is required'),
});

const EditUserModal: React.FC<EditUserModalProps> = ({ user, open, onClose, onSuccess }) => {
  // Removed unused FormData type
  type FormData = {
    name: string;
    email: string;
    address: string;
    role: 'admin' | 'user' | 'store_owner';
  };
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      address: user.address || '',
      role: user.role as 'admin' | 'user' | 'store_owner',
    } : {
      name: '',
      email: '',
      address: '',
      role: 'user',
    },
  });

  React.useEffect(() => {
    reset(user || {});
  }, [user, open, reset]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      await api.put(`/admin/users/${user.id}`, data);
      toast.success('User updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      let errorMsg = 'Failed to update user';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMsg = response.data.message;
        }
      }
      toast.error(errorMsg);
    }
  };

  if (!open || !user) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-0">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit User</h2>
          <button
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form className="px-6 py-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('name')}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('email')}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('address')}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('role')}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={false}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
