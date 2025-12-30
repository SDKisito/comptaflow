import React, { useState, useEffect } from 'react';
import { Filter, Download, AlertTriangle, Activity, Database, Shield, TrendingUp } from 'lucide-react';
import { auditTrailService } from '../../services/auditTrailService';
import MetricsOverview from './components/MetricsOverview';
import ActivityStream from './components/ActivityStream';
import FilterPanel from './components/FilterPanel';
import SecurityAlertsPanel from './components/SecurityAlertsPanel';
import Icon from '../../components/AppIcon';


export default function AuditTrailDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    eventCategory: null,
    startDate: null,
    endDate: null,
    userId: null,
    ipAddress: null,
    resource: null,
    limit: 50,
    offset: 0
  });

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, api, webhooks, modifications, security

  useEffect(() => {
    loadDashboardData();
  }, [filters, activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get date range for statistics (last 30 days by default)
      const endDate = new Date();
      const startDate = new Date();
      startDate?.setDate(startDate?.getDate() - 30);

      // Load statistics
      const stats = await auditTrailService?.getStatistics(
        startDate?.toISOString(),
        endDate?.toISOString()
      );
      setStatistics(stats);

      // Load audit trail based on active tab
      let events = [];
      let count = 0;

      if (activeTab === 'all') {
        const result = await auditTrailService?.getAuditTrail(filters);
        events = result?.events;
        count = result?.totalCount;
      } else if (activeTab === 'api') {
        events = await auditTrailService?.getApiAccessLogs(filters);
        count = events?.length;
      } else if (activeTab === 'webhooks') {
        events = await auditTrailService?.getWebhookDeliveries(filters);
        count = events?.length;
      } else if (activeTab === 'modifications') {
        events = await auditTrailService?.getDataModifications(filters);
        count = events?.length;
      } else if (activeTab === 'security') {
        events = await auditTrailService?.getSecurityEvents(filters);
        count = events?.length;
      }

      setAuditEvents(events);
      setTotalCount(count);

      // Load security events for alerts panel
      const criticalEvents = await auditTrailService?.getSecurityEvents({
        severity: 'critical',
        isResolved: false,
        limit: 10
      });
      setSecurityEvents(criticalEvents);

    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err?.message || 'Failed to load audit trail data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await auditTrailService?.exportToCsv(filters);
    } catch (err) {
      console.error('Export failed:', err);
      setError(err?.message || 'Failed to export audit trail');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterApply = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
    setShowFilterPanel(false);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleFilterReset = () => {
    setFilters({
      eventCategory: null,
      startDate: null,
      endDate: null,
      userId: null,
      ipAddress: null,
      resource: null,
      limit: 50,
      offset: 0
    });
  };

  const handleResolveSecurityEvent = async (eventId, actionTaken) => {
    try {
      await auditTrailService?.resolveSecurityEvent(eventId, actionTaken);
      loadDashboardData(); // Reload to update security events
    } catch (err) {
      console.error('Failed to resolve event:', err);
      setError(err?.message || 'Failed to resolve security event');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Events', icon: Activity },
    { id: 'api', label: 'API Access', icon: Database },
    { id: 'webhooks', label: 'Webhooks', icon: TrendingUp },
    { id: 'modifications', label: 'Data Changes', icon: Database },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  if (loading && !statistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit trail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Trail Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive oversight of system activities, security events, and compliance monitoring
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
      {/* Metrics Overview */}
      {statistics && <MetricsOverview statistics={statistics} />}
      {/* Security Alerts - Show if there are critical unresolved events */}
      {securityEvents?.length > 0 && (
        <SecurityAlertsPanel 
          events={securityEvents} 
          onResolve={handleResolveSecurityEvent}
        />
      )}
      {/* Filter Panel */}
      {showFilterPanel && (
        <FilterPanel
          filters={filters}
          onApply={handleFilterApply}
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
          onClose={() => setShowFilterPanel(false)}
        />
      )}
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-1">
        <div className="flex gap-2">
          {tabs?.map((tab) => {
            const Icon = tab?.icon;
            return (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  activeTab === tab?.id
                    ? 'bg-indigo-50 text-indigo-700 font-medium' :'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab?.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Activity Stream */}
      <ActivityStream
        events={auditEvents}
        loading={loading}
        activeTab={activeTab}
        totalCount={totalCount}
        onLoadMore={() => {
          setFilters(prev => ({ ...prev, offset: prev?.offset + prev?.limit }));
        }}
      />
    </div>
  );
}