import React, { useState } from 'react';
import { Activity, Filter, FileText, CreditCard, Users, Settings, LogIn, TrendingUp } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export function ActivityFeedPanel({ activities, loading, onFilterChange }) {
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const getActivityIcon = (type) => {
    if (type?.includes('invoice')) return FileText;
    if (type?.includes('expense')) return CreditCard;
    if (type?.includes('client')) return Users;
    if (type?.includes('payment')) return CreditCard;
    if (type?.includes('report')) return TrendingUp;
    if (type?.includes('settings')) return Settings;
    if (type?.includes('login') || type?.includes('logout')) return LogIn;
    return Activity;
  };

  const getActivityColor = (type) => {
    if (type?.includes('created')) return 'text-green-600 bg-green-50';
    if (type?.includes('updated')) return 'text-blue-600 bg-blue-50';
    if (type?.includes('deleted')) return 'text-red-600 bg-red-50';
    if (type?.includes('login')) return 'text-indigo-600 bg-indigo-50';
    return 'text-gray-600 bg-gray-50';
  };

  const handleModuleChange = (module) => {
    setSelectedModule(module);
    onFilterChange?.({ module: module === 'all' ? null : module, activityType: selectedType === 'all' ? null : selectedType });
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    onFilterChange?.({ module: selectedModule === 'all' ? null : selectedModule, activityType: type === 'all' ? null : type });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Activity className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Flux d'activités</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5]?.map((i) => (
            <div key={i} className="animate-pulse flex items-start p-3 border-l-4 border-gray-200">
              <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Activity className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Flux d'activités</h2>
        </div>
        <Filter className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => handleModuleChange('all')}
          className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
            selectedModule === 'all' ?'bg-indigo-600 text-white' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => handleModuleChange('Facturation')}
          className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
            selectedModule === 'Facturation' ?'bg-indigo-600 text-white' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Facturation
        </button>
        <button
          onClick={() => handleModuleChange('Dépenses')}
          className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
            selectedModule === 'Dépenses' ?'bg-indigo-600 text-white' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Dépenses
        </button>
        <button
          onClick={() => handleModuleChange('Clients')}
          className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
            selectedModule === 'Clients' ?'bg-indigo-600 text-white' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Clients
        </button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {activities?.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucune activité récente</p>
          </div>
        ) : (
          activities?.map((activity) => {
            const Icon = getActivityIcon(activity?.activityType);
            const colorClass = getActivityColor(activity?.activityType);
            
            return (
              <div
                key={activity?.id}
                className="flex items-start p-3 border-l-4 border-indigo-200 hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-full ${colorClass} mr-3 flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-1">
                    {activity?.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-medium">
                      {activity?.userProfile?.fullName || 'Système'}
                    </span>
                    <span>•</span>
                    <span>{activity?.module}</span>
                    <span>•</span>
                    <span>
                      {new Date(activity.createdAt)?.toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}