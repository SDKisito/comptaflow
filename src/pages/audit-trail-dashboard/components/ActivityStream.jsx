import React from 'react';
import { Clock, User, Globe, FileText, ChevronDown } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function ActivityStream({ events, loading, activeTab, totalCount, onLoadMore }) {
  const getEventIcon = (eventCategory) => {
    switch (eventCategory) {
      case 'api_access':
        return Globe;
      case 'webhook_delivery':
        return FileText;
      case 'data_modification':
        return FileText;
      case 'security_event':
        return User;
      default:
        return FileText;
    }
  };

  const getEventColor = (outcome, category) => {
    if (category === 'security_event') {
      if (outcome === 'critical') return 'bg-red-100 text-red-800';
      if (outcome === 'high') return 'bg-orange-100 text-orange-800';
      return 'bg-yellow-100 text-yellow-800';
    }

    if (outcome?.includes('success') || outcome?.includes('completed') || outcome?.includes('200')) {
      return 'bg-green-100 text-green-800';
    }
    if (outcome?.includes('failed') || outcome?.includes('error') || outcome?.includes('4') || outcome?.includes('5')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity stream...</p>
        </div>
      </div>
    );
  }

  if (!events || events?.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
        <p className="text-gray-600">
          No audit events match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Activity Stream
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({totalCount} total events)
          </span>
        </h2>
      </div>
      {/* Event List */}
      <div className="divide-y divide-gray-200">
        {events?.map((event) => {
          const Icon = getEventIcon(event?.eventCategory || event?.event_category);
          const colorClass = getEventColor(
            event?.outcome || event?.severity || event?.statusCode?.toString(),
            event?.eventCategory || event?.event_category
          );

          return (
            <div
              key={event?.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                          {event?.eventCategory || event?.event_category || 'Unknown'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {event?.action || event?.method || 'N/A'}
                        </span>
                      </div>

                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {event?.resource || event?.endpoint || event?.entityType || event?.description || 'Unknown Resource'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {event?.userId && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>User: {event?.userId?.substring(0, 8)}...</span>
                          </div>
                        )}
                        {event?.ipAddress && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            <span>{event?.ipAddress}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimestamp(event?.createdAt || event?.created_at)}</span>
                        </div>
                      </div>

                      {/* Additional details based on event type */}
                      {event?.errorMessage && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          Error: {event?.errorMessage}
                        </div>
                      )}

                      {event?.durationMs && (
                        <div className="mt-2 text-sm text-gray-600">
                          Duration: {event?.durationMs}ms
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        getEventColor(event?.outcome || event?.severity || event?.statusCode?.toString(), event?.eventCategory || event?.event_category)
                      }`}>
                        {event?.outcome || event?.severity || event?.statusCode || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Load More Button */}
      {events?.length < totalCount && (
        <div className="p-6 border-t border-gray-200 text-center">
          <button
            onClick={onLoadMore}
            className="px-6 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 mx-auto"
          >
            <ChevronDown className="w-5 h-5" />
            Load More Events
          </button>
        </div>
      )}
    </div>
  );
}