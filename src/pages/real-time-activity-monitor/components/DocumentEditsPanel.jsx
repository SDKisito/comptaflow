import React from 'react';
import { FileEdit, Clock, Users as UsersIcon } from 'lucide-react';

export function DocumentEditsPanel({ edits, loading }) {
  const getDocumentTypeLabel = (type) => {
    const typeLabels = {
      invoice: 'Facture',
      expense: 'Dépense',
      client: 'Client',
      report: 'Rapport'
    };
    return typeLabels?.[type] || type;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Brouillon',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    return labels?.[status] || status;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FileEdit className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Modifications en cours</h2>
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
          <FileEdit className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Modifications en cours</h2>
        </div>
        <span className="text-sm text-gray-500">{edits?.length || 0} document(s)</span>
      </div>
      <div className="space-y-3">
        {edits?.length === 0 ? (
          <div className="text-center py-8">
            <FileEdit className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucune modification en cours</p>
          </div>
        ) : (
          edits?.map((edit) => (
            <div
              key={edit?.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {getDocumentTypeLabel(edit?.documentType)}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(edit?.editStatus)}`}>
                      {getStatusLabel(edit?.editStatus)}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {edit?.documentTitle}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {edit?.documentId}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <div className="flex items-center mr-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                      <span className="text-indigo-600 font-medium text-xs">
                        {edit?.userProfile?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="truncate max-w-[120px]">
                      {edit?.userProfile?.fullName || 'Utilisateur'}
                    </span>
                  </div>
                  {edit?.isConcurrent && (
                    <div className="flex items-center">
                      <UsersIcon className="w-3 h-3 mr-1" />
                      <span>{edit?.concurrentUsers?.length || 0} autres</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>
                    {new Date(edit.lastModified)?.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {edit?.changesCount} modification(s)
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}