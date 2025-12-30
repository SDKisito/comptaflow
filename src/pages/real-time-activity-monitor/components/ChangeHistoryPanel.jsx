import React, { useState } from 'react';
import { History, AlertCircle, Undo2, ChevronRight } from 'lucide-react';

export function ChangeHistoryPanel({ changes, loading }) {
  const [expandedChange, setExpandedChange] = useState(null);

  const getActionColor = (action) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      created: 'Création',
      updated: 'Modification',
      deleted: 'Suppression'
    };
    return labels?.[action] || action;
  };

  const toggleExpand = (changeId) => {
    setExpandedChange(expandedChange === changeId ? null : changeId);
  };

  const formatValue = (value) => {
    if (!value) return '-';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <History className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Historique des modifications</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3]?.map((i) => (
            <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
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
          <History className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Historique des modifications</h2>
        </div>
        <span className="text-sm text-gray-500">{changes?.length || 0} modification(s)</span>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {changes?.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucune modification enregistrée</p>
          </div>
        ) : (
          changes?.map((change) => (
            <div
              key={change?.id}
              className={`border rounded-lg overflow-hidden ${
                change?.isCritical ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(change?.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getActionColor(change?.action)}`}>
                        {getActionLabel(change?.action)}
                      </span>
                      {change?.isCritical && (
                        <span className="flex items-center text-xs text-red-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Critique
                        </span>
                      )}
                      {change?.canRollback && (
                        <button className="flex items-center text-xs text-indigo-600 hover:text-indigo-800">
                          <Undo2 className="w-3 h-3 mr-1" />
                          Restaurer
                        </button>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {change?.entityTitle}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {change?.entityType} • {change?.entityId}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedChange === change?.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                      <span className="text-indigo-600 font-medium text-xs">
                        {change?.userProfile?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="truncate max-w-[150px]">
                      {change?.userProfile?.fullName || 'Système'}
                    </span>
                  </div>
                  <span>
                    {new Date(change.createdAt)?.toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              {expandedChange === change?.id && change?.fieldChanged && (
                <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Champ modifié: <span className="text-indigo-600">{change?.fieldChanged}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Ancienne valeur:</p>
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                            {formatValue(change?.oldValue)}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Nouvelle valeur:</p>
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                            {formatValue(change?.newValue)}
                          </pre>
                        </div>
                      </div>
                    </div>
                    {change?.changeReason && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Raison:</p>
                        <p className="text-xs text-gray-700">{change?.changeReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}