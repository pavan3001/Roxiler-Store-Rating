import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Store, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const schema = yup.object({
  name: yup
    .string()
    .min(5, 'Name must be at least 5 characters')
    .max(60, 'Name must not exceed 60 characters')
    .required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
      'Password must contain at least one uppercase letter and one special character'
    )
    .required('Password is required'),
  address: yup
    .string()
    .max(400, 'Address must not exceed 400 characters')
    .required('Address is required'),
  role: yup
    .string()
    .oneOf(['user', 'store_owner'], 'Select a valid account type')
    .required('Account type is required'),
});

type FormData = yup.InferType<typeof schema>;

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      
      login(token, user);
      toast.success('Registration successful!');
      navigate('/stores');
    } catch (error: unknown) {
      // Safely extract message from different error shapes without using `any`
      const getErrorMessage = (e: unknown) => {
        if (e instanceof Error) return e.message;
        if (typeof e === 'object' && e !== null) {
          const maybe = (e as Record<string, unknown>);
          if ('response' in maybe && typeof maybe.response === 'object' && maybe.response !== null) {
            const resp = maybe.response as Record<string, unknown>;
            if ('data' in resp && typeof resp.data === 'object' && resp.data !== null) {
              const d = resp.data as Record<string, unknown>;
              // If backend sent a validation errors array, join the messages
              if ('errors' in d && Array.isArray(d.errors)) {
                const arr = d.errors as Array<Record<string, unknown>>;
                const msgs = arr
                  .map(item => (item['msg'] as unknown) || (item['message'] as unknown) || JSON.stringify(item))
                  .filter(Boolean)
                  .map(String);
                if (msgs.length) return msgs.join('; ');
              }
              if ('message' in d && typeof d.message === 'string') return d.message;
            }
          }
        }
        return 'Registration failed';
      };
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -left-24 -top-24 w-72 h-72 bg-gradient-to-tr from-indigo-300 to-cyan-300 opacity-30 rounded-full filter blur-3xl animate-pulse transform rotate-12" />
      <div className="absolute -right-32 bottom-8 w-96 h-96 bg-gradient-to-br from-pink-300 to-violet-300 opacity-25 rounded-full filter blur-3xl animate-pulse" />
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left hero */}
          <div className="hidden md:flex flex-col items-start space-y-6">
            <Store className="w-14 h-14 text-indigo-600" />
            <h1 className="text-4xl font-extrabold text-gray-900">Create your account</h1>
            <p className="text-gray-600 max-w-md">Choose your account type to start rating stores or managing your own. Registration takes a moment.</p>
            <div className="mt-4">
              <Link to="/login" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Sign in instead</Link>
            </div>
          </div>

          {/* Right form */}
          <div className="mx-auto w-full max-w-md">
            <div className="bg-white/60 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-white/40 ring-1 ring-white/10">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                <p className="text-sm text-gray-600 mt-2">Or <Link to="/login" className="text-indigo-600 font-medium">sign in to your existing account</Link></p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1">
                    <input {...register('name')} type="text" autoComplete="name" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="Enter your full name (5-60 characters)" />
                    {errors.name && (<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>)}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="mt-1 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><Mail className="w-4 h-4" /></div>
                    <input {...register('email')} type="email" autoComplete="email" className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors" placeholder="Enter your email" />
                    {errors.email && (<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>)}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><Lock className="w-4 h-4" /></div>
                    <input {...register('password')} type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors" placeholder="8-16 chars, 1 uppercase, 1 special char" />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>{showPassword ? (<EyeOff className="h-4 w-4 text-gray-400" />) : (<Eye className="h-4 w-4 text-gray-400" />)}</button>
                  </div>
                  {errors.password && (<p className="mt-1 text-sm text-red-600">{errors.password.message}</p>)}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="mt-1">
                    <textarea {...register('address')} rows={3} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none" placeholder="Enter your address (max 400 characters)" />
                    {errors.address && (<p className="mt-1 text-sm text-red-600">{errors.address.message}</p>)}
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Account type</label>
                  <div className="mt-1">
                    <select {...register('role')} className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                      <option value="user">User</option>
                      <option value="store_owner">Store owner</option>
                    </select>
                    {errors.role && (<p className="mt-1 text-sm text-red-600">{errors.role.message}</p>)}
                  </div>
                </div>

                <div>
                  <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.01] transform transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Creating account...' : 'Create account'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;