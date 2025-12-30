import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ValidationSection = ({ validationResults, onFixError }) => {
  const { valid, errors, warnings, summary } = validationResults;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Étape 3 : Validation des données
      </h2>
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">Lignes valides</p>
                <p className="text-2xl font-bold text-green-700">{summary?.validRows || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-900">Erreurs</p>
                <p className="text-2xl font-bold text-red-700">{errors?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-amber-900">Avertissements</p>
                <p className="text-2xl font-bold text-amber-700">{warnings?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Errors */}
        {errors && errors?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-red-900 mb-3 flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              Erreurs à corriger ({errors?.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {errors?.map((error, idx) => (
                <div
                  key={idx}
                  className="bg-red-50 border border-red-200 rounded-md p-3 text-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-red-900">
                        Ligne {error?.row} - {error?.field}
                      </p>
                      <p className="text-red-700 mt-1">{error?.message}</p>
                      {error?.value && (
                        <p className="text-red-600 text-xs mt-1">
                          Valeur : {error?.value}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings && warnings?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-amber-900 mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Avertissements ({warnings?.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {warnings?.map((warning, idx) => (
                <div
                  key={idx}
                  className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm"
                >
                  <p className="font-medium text-amber-900">
                    Ligne {warning?.row} - {warning?.field}
                  </p>
                  <p className="text-amber-700 mt-1">{warning?.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success message */}
        {valid && errors?.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Validation réussie !
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Toutes les données sont prêtes à être importées.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationSection;