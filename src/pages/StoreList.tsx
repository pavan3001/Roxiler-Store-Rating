import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Edit3, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { Store } from '../types';
import RatingModal from '../components/RatingModal';
import UpdatePasswordModal from '../components/UpdatePasswordModal';

const StoreList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, [search, sort]);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.order);

      const response = await api.get(`/stores?${params}`);
      setStores(response.data);
    } catch (error) {
      toast.error('Failed to fetch stores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRatingSubmit = (storeId: number, rating: number) => {
    setStores(prev => prev.map(store => 
      store.id === storeId 
        ? { ...store, user_rating: rating }
        : store
    ));
  };

  const renderStars = (rating: number, interactive = false, onClick?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onClick && onClick(star)}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Update Password</span>
        </button>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search stores by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleSort('name')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              sort.field === 'name'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Name {sort.field === 'name' && (sort.order === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('overall_rating')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              sort.field === 'overall_rating'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rating {sort.field === 'overall_rating' && (sort.order === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {store.name}
              </h3>
              <button
                onClick={() => {
                  setSelectedStore(store);
                  setShowRatingModal(true);
                }}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>Rate</span>
              </button>
            </div>

            <div className="flex items-start space-x-2 mb-4">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 line-clamp-2">{store.address}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Overall Rating</span>
                <div className="flex items-center space-x-2">
                  {renderStars(Math.round(store.overall_rating))}
                  <span className="text-sm text-gray-600">
                    {parseFloat(store.overall_rating.toString()).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({store.total_ratings})
                  </span>
                </div>
              </div>

              {store.user_rating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Your Rating</span>
                  <div className="flex items-center space-x-2">
                    {renderStars(store.user_rating)}
                    <span className="text-sm font-medium text-indigo-600">
                      {store.user_rating}
                    </span>
                  </div>
                </div>
              )}

              {!store.user_rating && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-400">Not rated yet</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-500">
            {search ? 'Try adjusting your search terms' : 'No stores are available at the moment'}
          </p>
        </div>
      )}

      {/* Modals */}
      {showRatingModal && selectedStore && (
        <RatingModal
          store={selectedStore}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedStore(null);
          }}
          onSuccess={handleRatingSubmit}
        />
      )}

      {showPasswordModal && (
        <UpdatePasswordModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default StoreList;