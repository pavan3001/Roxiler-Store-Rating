import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import api from '../utils/api';
import { Store, User } from '../types';

const schema = yup.object({
  // All fields optional for partial updates. Empty strings are treated as not-provided.
  name: yup
    .string()
    .transform((v) => (v === '' ? undefined : v))
    .max(255, 'Store name must not exceed 255 characters')
    .optional(),
  email: yup
    .string()
    .transform((v) => (v === '' ? undefined : v))
    .email('Invalid email')
    .optional(),
  address: yup
    .string()
    .transform((v) => (v === '' ? undefined : v))
    .max(400, 'Address must not exceed 400 characters')
    .optional(),
  ownerEmail: yup
    .string()
    .transform((v) => (v === '' ? undefined : v))
    .email('Invalid owner email')
    .optional(),
});

type FormData = yup.InferType<typeof schema>;

interface EditStoreModalProps {
  store: Partial<Store>;
  onClose: () => void;
  onSuccess: () => void;
  forOwner?: boolean;
}

const EditStoreModal: React.FC<EditStoreModalProps> = ({ store, onClose, onSuccess, forOwner = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  // ownerId not needed for owner flow; admin owner lookups are done on submit when needed

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    // resolver typing can be strict in some TS setups — cast to any to avoid type mismatch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
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
      if (!forOwner) {
        if (store.owner_id) {
          try {
            const res = await api.get(`/admin/users?role=store_owner`);
            const owners: User[] = res.data;
            const owner = owners.find(u => u.id === store.owner_id);
            if (owner) {
              setValue('ownerEmail', owner.email);
            }
          } catch (fetchErr) {
            setValue('ownerEmail', '');
            console.debug('fetchOwnerEmail error', fetchErr);
          }
        } else {
          setValue('ownerEmail', '');
        }
      } else {
        // for owners, ownerEmail is not editable; set to empty
        setValue('ownerEmail', '');
      }
    }
    fetchOwnerEmail();
  }, [store.owner_id, setValue, forOwner]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Build request body
      // Build body with only provided (non-empty) values
      const body: Record<string, unknown> = {};
      if (typeof data.name === 'string' && data.name.trim() !== '') body.name = data.name.trim();
      if (typeof data.email === 'string' && data.email.trim() !== '') body.email = data.email.trim();
      if (typeof data.address === 'string' && data.address.trim() !== '') body.address = data.address.trim();

  // Admin path: allow owner reassignment via ownerEmail lookup
      if (!forOwner && data.ownerEmail) {
        try {
          const res = await api.get(`/admin/users?role=store_owner&search=${encodeURIComponent(data.ownerEmail)}`);
          const owners: User[] = res.data;
          const found = owners.find(u => u.email === data.ownerEmail);
          if (!found) {
            toast.error('Store owner not found with this email');
            setIsLoading(false);
            return;
          }
          body.owner_id = found.id;
        } catch (errLookup) {
          toast.error('Failed to lookup owner');
          console.debug('owner lookup error', errLookup);
          setIsLoading(false);
          return;
        }
      }

      if (!store?.id) {
        toast.error('Store ID missing — cannot update');
        setIsLoading(false);
        return;
      }

      const endpoint = forOwner ? `/stores/${store.id}` : `/admin/stores/${store.id}`;
      // debug before sending
      try { console.debug('EditStoreModal PUT', { endpoint, body }); } catch (e) { console.debug('debug log failed', e); }
      await api.put(endpoint, body);
      toast.success('Store updated successfully!');
      onSuccess();
    } catch (error: unknown) {
      // Improved error reporting for diagnostics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = error;
      try {
        console.debug('EditStoreModal submit error', {
          status: err?.response?.status,
          url: err?.config?.url,
          data: err?.response?.data,
        });
      } catch (e) {
        console.debug('debug log error', e);
      }

      if (err?.response?.status === 403) {
        toast.error(err?.response?.data?.message || 'Access denied (403) — insufficient permissions');
      } else if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to update store');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center p-4 z-50 modal-overlay-light">
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