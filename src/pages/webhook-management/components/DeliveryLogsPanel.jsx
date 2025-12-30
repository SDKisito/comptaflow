import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function DeliveryLogsPanel({ logs, stats, onRefresh, isLoading }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'retrying':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50';
      case 'failed':
        return 'text-red-700 bg-red-50';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50';
      case 'retrying':
        return 'text-blue-700 bg-blue-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const filteredLogs = selectedStatus === 'all' 
    ? logs 
    : logs?.filter(log => log?.deliveryStatus === selectedStatus);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Logs</h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="retrying">Retrying</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-lg font-semibold text-gray-900">{stats?.total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Success</p>
            <p className="text-lg font-semibold text-green-600">{stats?.success}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Failed</p>
            <p className="text-lg font-semibold text-red-600">{stats?.failed}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Success Rate</p>
            <p className="text-lg font-semibold text-blue-600">{stats?.successRate}%</p>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {filteredLogs?.map((log) => (
          <div
            key={log?.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedLog(expandedLog === log?.id ? null : log?.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(log?.deliveryStatus)}
                <div>
                  <p className="font-medium text-gray-900">{log?.event?.eventName || log?.eventCode}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.createdAt)?.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {log?.httpStatusCode && (
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    log?.httpStatusCode >= 200 && log?.httpStatusCode < 300
                      ? 'text-green-700 bg-green-50' :'text-red-700 bg-red-50'
                  }`}>
                    HTTP {log?.httpStatusCode}
                  </span>
                )}
                {log?.deliveryDurationMs && (
                  <span className="text-xs text-gray-500">{log?.deliveryDurationMs}ms</span>
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(log?.deliveryStatus)}`}>
                  {log?.deliveryStatus}
                </span>
              </div>
            </div>

            {expandedLog === log?.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                {log?.requestPayload && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Request Payload:</p>
                    <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                      {JSON.stringify(log?.requestPayload, null, 2)}
                    </pre>
                  </div>
                )}
                {log?.responseBody && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Response:</p>
                    <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                      {log?.responseBody}
                    </pre>
                  </div>
                )}
                {log?.errorMessage && (
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-1">Error:</p>
                    <p className="text-xs text-red-600 bg-white p-2 rounded border border-red-200">
                      {log?.errorMessage}
                    </p>
                  </div>
                )}
                {log?.retryCount > 0 && (
                  <div className="text-xs text-gray-600">
                    Retry attempts: {log?.retryCount}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredLogs?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No delivery logs found
          </div>
        )}
      </div>
    </div>
  );
}