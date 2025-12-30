import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

export default function SecurityAlertsPanel({ events, onResolve }) {
  const [resolvingEventId, setResolvingEventId] = useState(null);
  const [actionText, setActionText] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);

  const handleResolveClick = (eventId) => {
    setResolvingEventId(eventId);
    setShowResolveModal(true);
  };

  const handleResolveSubmit = async () => {
    if (!actionText?.trim()) return;

    try {
      await onResolve(resolvingEventId, actionText);
      setShowResolveModal(false);
      setActionText('');
      setResolvingEventId(null);
    } catch (err) {
      console.error('Failed to resolve event:', err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (!events || events?.length === 0) return null;

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-4">
              Critical Security Alerts ({events?.length})
            </h3>
            <div className="space-y-3">
              {events?.map((event) => (
                <div
                  key={event?.id}
                  className={`bg-white border rounded-lg p-4 ${getSeverityColor(event?.severity)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event?.severity)}`}>
                          {event?.severity?.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {event?.eventType?.replace(/_/g, ' ')?.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-2">{event?.description}</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        {event?.affectedResource && (
                          <p>Resource: {event?.affectedResource}</p>
                        )}
                        {event?.ipAddress && (
                          <p>IP Address: {event?.ipAddress}</p>
                        )}
                        <p>Time: {new Date(event.createdAt)?.toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResolveClick(event?.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 flex-shrink-0"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resolve Security Event</h3>
              <button
                onClick={() => setShowResolveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Taken
              </label>
              <textarea
                value={actionText}
                onChange={(e) => setActionText(e?.target?.value)}
                placeholder="Describe the action taken to resolve this security event..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={!actionText?.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}