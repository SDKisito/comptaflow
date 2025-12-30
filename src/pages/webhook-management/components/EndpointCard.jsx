import React from 'react';
import { Settings, Trash2, Power, CheckCircle, XCircle } from 'lucide-react';

export default function EndpointCard({ endpoint, onEdit, onDelete, onToggleStatus }) {
  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50';
  };

  const successRate = endpoint?.totalDeliveries > 0
    ? Math.round((endpoint?.successfulDeliveries / endpoint?.totalDeliveries) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{endpoint?.endpointName}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(endpoint?.isActive)}`}>
              {endpoint?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{endpoint?.url}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Auth: {endpoint?.authMethod}</span>
            {endpoint?.lastDeliveryAt && (
              <span>Last delivery: {new Date(endpoint.lastDeliveryAt)?.toLocaleString()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleStatus(endpoint?.id, !endpoint?.isActive)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={endpoint?.isActive ? 'Disable' : 'Enable'}
          >
            <Power className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(endpoint)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit endpoint"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(endpoint?.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete endpoint"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Deliveries</p>
          <p className="text-lg font-semibold text-gray-900">{endpoint?.totalDeliveries}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Success Rate</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-green-600">{successRate}%</p>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Failed</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-red-600">{endpoint?.failedDeliveries}</p>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}