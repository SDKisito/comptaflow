import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { activityMonitorService } from '../../services/activityMonitorService';
import { ActiveUsersPanel } from './components/ActiveUsersPanel';
import { DocumentEditsPanel } from './components/DocumentEditsPanel';
import { ActivityFeedPanel } from './components/ActivityFeedPanel';
import { ChangeHistoryPanel } from './components/ChangeHistoryPanel';

export default function RealTimeActivityMonitor() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [documentEdits, setDocumentEdits] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [changeHistory, setChangeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadAllData();
    setupRealtimeSubscriptions();
  }, []);

  useEffect(() => {
    if (Object.keys(filters)?.length > 0) {
      loadActivityLogs(filters);
    }
  }, [filters]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [sessions, edits, logs, history] = await Promise.all([
        activityMonitorService?.getActiveSessions(),
        activityMonitorService?.getDocumentEdits(),
        activityMonitorService?.getActivityLogs({ limit: 50 }),
        activityMonitorService?.getChangeHistory({ limit: 30 })
      ]);

      setActiveSessions(sessions);
      setDocumentEdits(edits);
      setActivityLogs(logs);
      setChangeHistory(history);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des données');
      console.error('Error loading activity data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async (filterParams) => {
    try {
      const logs = await activityMonitorService?.getActivityLogs({ 
        ...filterParams, 
        limit: 50 
      });
      setActivityLogs(logs);
    } catch (err) {
      console.error('Error loading activity logs:', err);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const unsubscribeSessions = activityMonitorService?.subscribeToActiveSessions((payload) => {
      if (payload?.eventType === 'INSERT') {
        setActiveSessions(prev => [payload?.new, ...prev]);
      } else if (payload?.eventType === 'UPDATE') {
        setActiveSessions(prev => 
          prev?.map(session => session?.id === payload?.new?.id ? payload?.new : session)
        );
      } else if (payload?.eventType === 'DELETE') {
        setActiveSessions(prev => prev?.filter(session => session?.id !== payload?.old?.id));
      }
    });

    const unsubscribeEdits = activityMonitorService?.subscribeToDocumentEdits((payload) => {
      if (payload?.eventType === 'INSERT') {
        setDocumentEdits(prev => [payload?.new, ...prev]);
      } else if (payload?.eventType === 'UPDATE') {
        setDocumentEdits(prev => 
          prev?.map(edit => edit?.id === payload?.new?.id ? payload?.new : edit)
        );
      } else if (payload?.eventType === 'DELETE') {
        setDocumentEdits(prev => prev?.filter(edit => edit?.id !== payload?.old?.id));
      }
    });

    const unsubscribeLogs = activityMonitorService?.subscribeToActivityLogs((payload) => {
      if (payload?.eventType === 'INSERT') {
        setActivityLogs(prev => [payload?.new, ...prev?.slice(0, 49)]);
      }
    });

    const unsubscribeHistory = activityMonitorService?.subscribeToChangeHistory((payload) => {
      if (payload?.eventType === 'INSERT') {
        setChangeHistory(prev => [payload?.new, ...prev?.slice(0, 29)]);
      }
    });

    return () => {
      unsubscribeSessions();
      unsubscribeEdits();
      unsubscribeLogs();
      unsubscribeHistory();
    };
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    loadAllData();
  };

  return (
    <>
      <Helmet>
        <title>Moniteur d'activité en temps réel - ComptaFlow</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Moniteur d'activité en temps réel
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Suivi des utilisateurs actifs, modifications en cours et historique des actions
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Actualiser</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">Erreur</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActiveUsersPanel sessions={activeSessions} loading={loading} />
            <DocumentEditsPanel edits={documentEdits} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityFeedPanel 
              activities={activityLogs} 
              loading={loading}
              onFilterChange={handleFilterChange}
            />
            <ChangeHistoryPanel changes={changeHistory} loading={loading} />
          </div>
        </div>
      </div>
    </>
  );
}