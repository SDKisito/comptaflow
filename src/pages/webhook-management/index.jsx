import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Webhook, RefreshCw } from 'lucide-react';
import EndpointCard from './components/EndpointCard';
import EndpointFormModal from './components/EndpointFormModal';
import EventSubscriptionPanel from './components/EventSubscriptionPanel';
import DeliveryLogsPanel from './components/DeliveryLogsPanel';
import webhookService from '../../services/webhookService';
import { supabase } from '../../lib/supabase';

export default function WebhookManagement() {
  const [endpoints, setEndpoints] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedEndpoint) {
      loadEndpointDetails(selectedEndpoint?.id);
    }
  }, [selectedEndpoint]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      setCurrentUser(user);
    } catch (err) {
      setError('Failed to load user data');
      console.error(err);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [endpointsData, eventsData] = await Promise.all([
        webhookService?.endpoints?.getAll(currentUser?.id),
        webhookService?.events?.getAll()
      ]);

      setEndpoints(endpointsData);
      setEvents(eventsData);

      if (endpointsData?.length > 0 && !selectedEndpoint) {
        setSelectedEndpoint(endpointsData?.[0]);
      }
    } catch (err) {
      setError(err?.message);
      console.error('Error loading webhook data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEndpointDetails = async (endpointId) => {
    try {
      const [subsData, logsData, statsData] = await Promise.all([
        webhookService?.subscriptions?.getByEndpoint(endpointId),
        webhookService?.deliveries?.getByEndpoint(endpointId, { limit: 50 }),
        webhookService?.deliveries?.getStats(endpointId, 7)
      ]);

      setSubscriptions(subsData);
      setDeliveryLogs(logsData);
      setDeliveryStats(statsData);
    } catch (err) {
      console.error('Error loading endpoint details:', err);
    }
  };

  const handleCreateEndpoint = () => {
    setEditingEndpoint(null);
    setIsModalOpen(true);
  };

  const handleEditEndpoint = (endpoint) => {
    setEditingEndpoint(endpoint);
    setIsModalOpen(true);
  };

  const handleSubmitEndpoint = async (formData) => {
    try {
      setIsSaving(true);
      if (editingEndpoint) {
        const updated = await webhookService?.endpoints?.update(editingEndpoint?.id, formData);
        setEndpoints(endpoints?.map(e => e?.id === updated?.id ? updated : e));
        if (selectedEndpoint?.id === updated?.id) {
          setSelectedEndpoint(updated);
        }
      } else {
        const created = await webhookService?.endpoints?.create(formData);
        setEndpoints([created, ...endpoints]);
        if (!selectedEndpoint) {
          setSelectedEndpoint(created);
        }
      }
      setIsModalOpen(false);
      setEditingEndpoint(null);
    } catch (err) {
      setError(err?.message);
      console.error('Error saving endpoint:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEndpoint = async (endpointId) => {
    if (!window.confirm('Are you sure you want to delete this webhook endpoint?')) {
      return;
    }

    try {
      await webhookService?.endpoints?.delete(endpointId);
      setEndpoints(endpoints?.filter(e => e?.id !== endpointId));
      if (selectedEndpoint?.id === endpointId) {
        setSelectedEndpoint(endpoints?.find(e => e?.id !== endpointId) || null);
      }
    } catch (err) {
      setError(err?.message);
      console.error('Error deleting endpoint:', err);
    }
  };

  const handleToggleEndpointStatus = async (endpointId, isActive) => {
    try {
      const updated = await webhookService?.endpoints?.update(endpointId, { isActive });
      setEndpoints(endpoints?.map(e => e?.id === updated?.id ? updated : e));
      if (selectedEndpoint?.id === updated?.id) {
        setSelectedEndpoint(updated);
      }
    } catch (err) {
      setError(err?.message);
      console.error('Error updating endpoint status:', err);
    }
  };

  const handleSubscribe = async (endpointId, eventCode) => {
    try {
      const subscription = await webhookService?.subscriptions?.subscribe(endpointId, eventCode);
      setSubscriptions([...subscriptions, subscription]);
    } catch (err) {
      setError(err?.message);
      console.error('Error subscribing to event:', err);
    }
  };

  const handleUnsubscribe = async (subscriptionId) => {
    try {
      await webhookService?.subscriptions?.unsubscribe(subscriptionId);
      setSubscriptions(subscriptions?.filter(s => s?.id !== subscriptionId));
    } catch (err) {
      setError(err?.message);
      console.error('Error unsubscribing from event:', err);
    }
  };

  const handleRefreshLogs = () => {
    if (selectedEndpoint) {
      loadEndpointDetails(selectedEndpoint?.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading webhook management...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Webhook Management - ComptaFlow</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Webhook className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Webhook Management</h1>
                  <p className="text-gray-600">Configure real-time event notifications for your integrations</p>
                </div>
              </div>
              <button
                onClick={handleCreateEndpoint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Webhook Endpoint
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-600 underline text-sm mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {endpoints?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Webhook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No webhook endpoints configured</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first webhook endpoint</p>
              <button
                onClick={handleCreateEndpoint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Webhook Endpoint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Webhook Endpoints</h2>
                {endpoints?.map((endpoint) => (
                  <EndpointCard
                    key={endpoint?.id}
                    endpoint={endpoint}
                    onEdit={handleEditEndpoint}
                    onDelete={handleDeleteEndpoint}
                    onToggleStatus={handleToggleEndpointStatus}
                    onSelectEndpoint={() => setSelectedEndpoint(endpoint)}
                    isSelected={selectedEndpoint?.id === endpoint?.id}
                  />
                ))}
              </div>

              {selectedEndpoint && (
                <div className="lg:col-span-2 space-y-6">
                  <EventSubscriptionPanel
                    endpointId={selectedEndpoint?.id}
                    events={events}
                    subscriptions={subscriptions}
                    onSubscribe={handleSubscribe}
                    onUnsubscribe={handleUnsubscribe}
                    isLoading={isSaving}
                  />

                  <DeliveryLogsPanel
                    logs={deliveryLogs}
                    stats={deliveryStats}
                    onRefresh={handleRefreshLogs}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <EndpointFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEndpoint(null);
        }}
        onSubmit={handleSubmitEndpoint}
        endpoint={editingEndpoint}
        isLoading={isSaving}
      />
    </>
  );
}