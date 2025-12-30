import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';

export default function EventSubscriptionPanel({ 
  endpointId, 
  events, 
  subscriptions, 
  onSubscribe, 
  onUnsubscribe,
  isLoading 
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredEvents, setFilteredEvents] = useState([]);

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'invoice', label: 'Invoice Events' },
    { value: 'payment', label: 'Payment Events' },
    { value: 'client', label: 'Client Events' },
    { value: 'expense', label: 'Expense Events' },
    { value: 'subscription', label: 'Subscription Events' }
  ];

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events?.filter(e => e?.eventCategory === selectedCategory));
    }
  }, [selectedCategory, events]);

  const isSubscribed = (eventCode) => {
    return subscriptions?.some(sub => sub?.eventCode === eventCode && sub?.isActive);
  };

  const getSubscription = (eventCode) => {
    return subscriptions?.find(sub => sub?.eventCode === eventCode);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Event Subscriptions</h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e?.target?.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories?.map(cat => (
            <option key={cat?.value} value={cat?.value}>{cat?.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        {filteredEvents?.map((event) => {
          const subscribed = isSubscribed(event?.eventCode);
          const subscription = getSubscription(event?.eventCode);

          return (
            <div
              key={event?.eventCode}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-medium text-gray-900">{event?.eventName}</h4>
                  <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                    {event?.eventCategory}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{event?.description}</p>
                {event?.payloadSchema && (
                  <details className="mt-2">
                    <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">
                      View payload schema
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(event?.payloadSchema, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              <button
                onClick={() => {
                  if (subscribed) {
                    onUnsubscribe(subscription?.id);
                  } else {
                    onSubscribe(endpointId, event?.eventCode);
                  }
                }}
                disabled={isLoading}
                className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 ${
                  subscribed
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' :'text-blue-600 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4" />
                    Subscribed
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Subscribe
                  </>
                )}
              </button>
            </div>
          );
        })}

        {filteredEvents?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No events available in this category
          </div>
        )}
      </div>
    </div>
  );
}