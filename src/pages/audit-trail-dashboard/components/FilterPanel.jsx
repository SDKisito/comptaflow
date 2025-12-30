import React, { useState } from 'react';
import { X, Calendar, User, Globe, FileText } from 'lucide-react';

export default function FilterPanel({ filters, onApply, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      eventCategory: null,
      startDate: null,
      endDate: null,
      userId: null,
      ipAddress: null,
      resource: null,
      limit: 50,
      offset: 0
    };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Advanced Filters
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Event Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Category
          </label>
          <select
            value={localFilters?.eventCategory || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, eventCategory: e?.target?.value || null })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="api_access">API Access</option>
            <option value="webhook_delivery">Webhook Delivery</option>
            <option value="data_modification">Data Modification</option>
            <option value="security_event">Security Event</option>
            <option value="activity">Activity</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </label>
            <input
              type="datetime-local"
              value={localFilters?.startDate || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, startDate: e?.target?.value || null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              End Date
            </label>
            <input
              type="datetime-local"
              value={localFilters?.endDate || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, endDate: e?.target?.value || null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* User ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            User ID
          </label>
          <input
            type="text"
            value={localFilters?.userId || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, userId: e?.target?.value || null })}
            placeholder="Enter user ID to filter"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* IP Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            IP Address
          </label>
          <input
            type="text"
            value={localFilters?.ipAddress || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, ipAddress: e?.target?.value || null })}
            placeholder="Enter IP address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Resource/Endpoint */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resource/Endpoint
          </label>
          <input
            type="text"
            value={localFilters?.resource || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, resource: e?.target?.value || null })}
            placeholder="Search resource or endpoint"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Results per page */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Results per page
          </label>
          <select
            value={localFilters?.limit}
            onChange={(e) => setLocalFilters({ ...localFilters, limit: parseInt(e?.target?.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>
      </div>
      {/* Actions */}
      <div className="p-6 border-t border-gray-200 flex justify-between">
        <button
          onClick={handleReset}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Reset Filters
        </button>
        <button
          onClick={handleApply}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}