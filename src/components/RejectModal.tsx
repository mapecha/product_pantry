import React, { useState } from 'react';
import { X } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  productName: string;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productName
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    onSubmit(comment.trim());
    setComment('');
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Zamítnout produkt
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Produkt: <span className="font-medium text-gray-900">{productName}</span>
            </p>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Důvod zamítnutí *
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Zadejte důvod zamítnutí produktu..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={isSubmitting}
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!comment.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Odesílání...' : 'Zamítnout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};