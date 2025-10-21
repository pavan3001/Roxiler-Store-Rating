import React, { useState, useEffect } from 'react';
import { Star, Users, Settings, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { StoreOwnerDashboard as StoreOwnerDashboardType } from '../types';
import UpdatePasswordModal from '../components/UpdatePasswordModal';
import EditStoreModal from '../components/EditStoreModal';
import { Store } from '../types';
// CreateStoreModal imported below once
import { useAuth } from '../context/AuthContext';
import CreateStoreModal from '../components/CreateStoreModal';

const StoreOwnerDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<StoreOwnerDashboardType | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const { user } = useAuth();
  const [showEditStore, setShowEditStore] = useState(false);
  const [editStoreData, setEditStoreData] = useState<Partial<Store> | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/stores/owner/dashboard');
      setDashboard(response.data);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = error as any;
      if (err?.response?.status === 404) {
        // When a store_owner has no store yet, this is expected behavior.
        // Show the 'No Store Found' UI but do not display an error toast.
        console.info('No store found for owner (silent):', err?.response?.data?.message || err?.message);
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Users className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Found</h3>
        <p className="text-gray-500">
          No store is associated with your account. Please contact the administrator.
        </p>
        <div className="mt-6">
          <button
            onClick={() => setShowCreateStore(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Store
          </button>
        </div>
        {/* modal rendering moved to main return so header Add Store always works */}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Store Dashboard</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {user?.role === 'store_owner' && (
            <button
              onClick={() => setShowCreateStore(true)}
              className="flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <span className="hidden sm:inline">Add Store</span>
              <span className="sm:hidden">+</span>
            </button>
          )}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Update Password</span>
          </button>
        </div>
      </div>

      {/* Store Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">{dashboard.stores[selectedStoreIndex].store.name}</h2>
            {dashboard.stores.length > 1 && (
              <select
                value={selectedStoreIndex}
                onChange={e => setSelectedStoreIndex(Number(e.target.value))}
                className="py-1 px-2 border border-gray-200 rounded"
              >
                {dashboard.stores.map((s, idx) => (
                  <option key={s.store.id} value={idx}>{s.store.name}</option>
                ))}
              </select>
            )}
            <div className="flex items-center space-x-2">
              <button
                title="Edit store"
                aria-label="Edit store"
                onClick={() => {
                  setEditStoreData(dashboard.stores[selectedStoreIndex].store as Partial<Store>);
                  setShowEditStore(true);
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 transition-colors ml-2"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                title="Delete store"
                aria-label="Delete store"
                onClick={async () => {
                  if (!window.confirm('Are you sure you want to delete this store?')) return;
                  try {
                    const id = dashboard.stores[selectedStoreIndex].store.id;
                    await api.delete(`/stores/${id}`);
                    toast.success('Store deleted successfully');
                    // Refresh dashboard and reset index
                    setSelectedStoreIndex(0);
                    fetchDashboard();
                  } catch (err) {
                    toast.error('Failed to delete store');
                    console.debug('owner delete error', err);
                  }
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          {showEditStore && editStoreData && (
            <EditStoreModal
              store={editStoreData}
              forOwner={true}
              onClose={() => {
                setShowEditStore(false);
                setEditStoreData(null);
              }}
              onSuccess={() => {
                setShowEditStore(false);
                setEditStoreData(null);
                fetchDashboard();
              }}
            />
          )}
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-yellow-400 fill-current" />
            <span className="text-2xl font-bold text-gray-900">{dashboard.stores[selectedStoreIndex].averageRating}</span>
            <span className="text-sm text-gray-500">average rating</span>
          </div>
        </div>
        
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Total Ratings</p>
                <p className="text-2xl font-bold text-blue-600">{dashboard.stores[selectedStoreIndex].ratingUsers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-900">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{dashboard.stores[selectedStoreIndex].averageRating}/5.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Ratings</h3>
          <p className="text-sm text-gray-600 mt-1">
            Users who have rated your store
          </p>
        </div>

        {dashboard.stores[selectedStoreIndex].ratingUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No ratings yet</h4>
            <p className="text-gray-500">
              Your store hasn't received any ratings from customers yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {dashboard.stores[selectedStoreIndex].ratingUsers.map((ratingUser, index) => (
              <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {ratingUser.name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {ratingUser.email}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Rated on {formatDate(ratingUser.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= ratingUser.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {ratingUser.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Password Modal */}
      {showPasswordModal && (
        <UpdatePasswordModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {/* Create Store Modal (available to store owners from header) */}
      {showCreateStore && (
        <CreateStoreModal
          forOwner={true}
          onClose={() => setShowCreateStore(false)}
          onSuccess={() => {
            setShowCreateStore(false);
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
};

export default StoreOwnerDashboard;