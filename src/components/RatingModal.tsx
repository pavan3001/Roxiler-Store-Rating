import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Star } from 'lucide-react';
import api from '../utils/api';
import { Store } from '../types';

interface RatingModalProps {
  store: Store;
  onClose: () => void;
  onSuccess: (storeId: number, rating: number) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ store, onClose, onSuccess }) => {
  const [rating, setRating] = useState(store.user_rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/stores/rating', {
        storeId: store.id,
        rating
      });
      
      toast.success(store.user_rating ? 'Rating updated successfully!' : 'Rating submitted successfully!');
      onSuccess(store.id, rating);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center justify-center space-x-2 my-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-8 h-8 cursor-pointer transition-colors ${
              star <= (hoveredRating || rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {store.user_rating ? 'Update Rating' : 'Rate Store'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {store.name}
            </h3>
            <p className="text-sm text-gray-600">{store.address}</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              How would you rate this store?
            </p>
            
            {renderStars()}
            
            {rating > 0 && (
              <p className="text-sm text-gray-500 mb-6">
                You selected: <span className="font-medium">{rating} star{rating !== 1 ? 's' : ''}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || rating === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Submitting...' : store.user_rating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;