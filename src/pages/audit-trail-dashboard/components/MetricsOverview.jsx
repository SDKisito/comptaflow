import React from 'react';
import { Activity, AlertTriangle, Database, TrendingUp } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function MetricsOverview({ statistics }) {
  if (!statistics) return null;

  const metrics = [
    {
      label: 'Total API Calls',
      value: statistics?.totalApiCalls?.toLocaleString() || '0',
      icon: Activity,
      color: 'blue',
      trend: statistics?.failedApiCalls > 0 
        ? `${statistics?.failedApiCalls} failed`
        : 'All successful'
    },
    {
      label: 'Webhook Success Rate',
      value: `${statistics?.webhookSuccessRate || 0}%`,
      icon: TrendingUp,
      color: statistics?.webhookSuccessRate >= 95 ? 'green' : 'yellow',
      trend: statistics?.webhookSuccessRate >= 95 ? 'Excellent' : 'Needs attention'
    },
    {
      label: 'Data Modifications',
      value: statistics?.totalDataModifications?.toLocaleString() || '0',
      icon: Database,
      color: 'purple',
      trend: 'Last 30 days'
    },
    {
      label: 'Security Alerts',
      value: statistics?.unresolvedSecurityEvents?.toLocaleString() || '0',
      icon: AlertTriangle,
      color: statistics?.criticalSecurityEvents > 0 ? 'red' : 'green',
      trend: statistics?.criticalSecurityEvents > 0 
        ? `${statistics?.criticalSecurityEvents} critical`
        : 'All clear'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      yellow: 'bg-yellow-50 text-yellow-700',
      purple: 'bg-purple-50 text-purple-700',
      red: 'bg-red-50 text-red-700'
    };
    return colors?.[color] || colors?.blue;
  };

  const getIconBgColor = (color) => {
    const colors = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      yellow: 'bg-yellow-100',
      purple: 'bg-purple-100',
      red: 'bg-red-100'
    };
    return colors?.[color] || colors?.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics?.map((metric, index) => {
        const Icon = metric?.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${getIconBgColor(metric?.color)}`}>
                <Icon className={`w-6 h-6 ${metric?.color === 'blue' ? 'text-blue-600' : 
                  metric?.color === 'green' ? 'text-green-600' : 
                  metric?.color === 'yellow' ? 'text-yellow-600' : 
                  metric?.color === 'purple'? 'text-purple-600' : 'text-red-600'}`} 
                />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getColorClasses(metric?.color)}`}>
                {metric?.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric?.value}</h3>
            <p className="text-sm text-gray-600">{metric?.label}</p>
          </div>
        );
      })}
    </div>
  );
}