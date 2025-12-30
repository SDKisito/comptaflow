import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EndpointFormModal({ isOpen, onClose, onSubmit, endpoint, isLoading }) {
  const [formData, setFormData] = useState({
    endpointName: '',
    url: '',
    authMethod: 'none',
    authSecret: '',
    sslVerify: true,
    rateLimitPerMinute: 60,
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (endpoint) {
      setFormData({
        endpointName: endpoint?.endpointName || '',
        url: endpoint?.url || '',
        authMethod: endpoint?.authMethod || 'none',
        authSecret: endpoint?.authSecret || '',
        sslVerify: endpoint?.sslVerify !== undefined ? endpoint?.sslVerify : true,
        rateLimitPerMinute: endpoint?.rateLimitPerMinute || 60,
        isActive: endpoint?.isActive !== undefined ? endpoint?.isActive : true
      });
    } else {
      setFormData({
        endpointName: '',
        url: '',
        authMethod: 'none',
        authSecret: '',
        sslVerify: true,
        rateLimitPerMinute: 60,
        isActive: true
      });
    }
  }, [endpoint]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.endpointName?.trim()) {
      newErrors.endpointName = 'Endpoint name is required';
    }
    
    if (!formData?.url?.trim()) {
      newErrors.url = 'URL is required';
    } else if (!/^https?:\/\/.+/?.test(formData?.url)) {
      newErrors.url = 'Please enter a valid HTTP/HTTPS URL';
    }
    
    if (formData?.authMethod !== 'none' && !formData?.authSecret?.trim()) {
      newErrors.authSecret = 'Authentication secret is required for selected auth method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {endpoint ? 'Edit Webhook Endpoint' : 'Add Webhook Endpoint'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endpoint Name *
            </label>
            <input
              type="text"
              name="endpointName"
              value={formData?.endpointName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors?.endpointName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Production API"
            />
            {errors?.endpointName && (
              <p className="text-red-500 text-xs mt-1">{errors?.endpointName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL *
            </label>
            <input
              type="url"
              name="url"
              value={formData?.url}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors?.url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://api.example.com/webhooks"
            />
            {errors?.url && (
              <p className="text-red-500 text-xs mt-1">{errors?.url}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authentication Method
              </label>
              <select
                name="authMethod"
                value={formData?.authMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">None</option>
                <option value="hmac_sha256">HMAC SHA256</option>
                <option value="bearer_token">Bearer Token</option>
                <option value="basic_auth">Basic Auth</option>
              </select>
            </div>

            {formData?.authMethod !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authentication Secret *
                </label>
                <input
                  type="password"
                  name="authSecret"
                  value={formData?.authSecret}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors?.authSecret ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter secret key"
                />
                {errors?.authSecret && (
                  <p className="text-red-500 text-xs mt-1">{errors?.authSecret}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate Limit (requests/minute)
              </label>
              <input
                type="number"
                name="rateLimitPerMinute"
                value={formData?.rateLimitPerMinute}
                onChange={handleChange}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="sslVerify"
                  checked={formData?.sslVerify}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">SSL Certificate Verification</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData?.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : endpoint ? 'Update Endpoint' : 'Create Endpoint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}