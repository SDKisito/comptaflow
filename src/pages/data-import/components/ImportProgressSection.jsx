import React from 'react';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

const ImportProgressSection = ({ 
  status, 
  progress, 
  totalRows, 
  processedRows, 
  successfulRows, 
  failedRows 
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Importation en cours...';
      case 'completed':
        return 'Importation terminée !';
      case 'failed':
        return 'Erreur lors de l\'importation';
      default:
        return 'En attente';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-indigo-900';
      case 'completed':
        return 'text-green-900';
      case 'failed':
        return 'text-red-900';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Étape 4 : Importation
      </h2>

      <div className="space-y-6">
        {/* Status */}
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className={`text-lg font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Progress bar */}
        {status === 'processing' && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalRows || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-md p-3">
            <p className="text-xs text-blue-600 uppercase tracking-wide">Traités</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{processedRows || 0}</p>
          </div>
          <div className="bg-green-50 rounded-md p-3">
            <p className="text-xs text-green-600 uppercase tracking-wide">Réussis</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{successfulRows || 0}</p>
          </div>
          <div className="bg-red-50 rounded-md p-3">
            <p className="text-xs text-red-600 uppercase tracking-wide">Échecs</p>
            <p className="text-2xl font-bold text-red-900 mt-1">{failedRows || 0}</p>
          </div>
        </div>

        {/* Completion message */}
        {status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Importation terminée avec succès
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {successfulRows} ligne{successfulRows > 1 ? 's' : ''} importée{successfulRows > 1 ? 's' : ''} 
                  {failedRows > 0 && `, ${failedRows} erreur${failedRows > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportProgressSection;