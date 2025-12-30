import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

const FieldMappingSection = ({ 
  parsedData, 
  entityType, 
  fieldMapping, 
  onMappingChange,
  requiredFields 
}) => {
  const availableColumns = useMemo(() => {
    if (!parsedData || parsedData?.length === 0) return [];
    return Object.keys(parsedData?.[0]);
  }, [parsedData]);

  const fieldDefinitions = useMemo(() => {
    if (entityType === 'invoices') {
      return {
        invoiceNumber: { label: 'Numéro de facture', required: true },
        issueDate: { label: 'Date d\'émission', required: true },
        dueDate: { label: 'Date d\'échéance', required: true },
        clientEmail: { label: 'Email client', required: false },
        subtotal: { label: 'Montant HT', required: true },
        taxRate: { label: 'Taux TVA (%)', required: true },
        totalAmount: { label: 'Montant TTC', required: true },
        description: { label: 'Description', required: false },
        status: { label: 'Statut', required: false }
      };
    } else if (entityType === 'clients') {
      return {
        email: { label: 'Email', required: true },
        clientType: { label: 'Type (individual/company)', required: true },
        companyName: { label: 'Nom entreprise', required: false },
        firstName: { label: 'Prénom', required: false },
        lastName: { label: 'Nom', required: false },
        phone: { label: 'Téléphone', required: false },
        siret: { label: 'SIRET', required: false },
        address: { label: 'Adresse', required: false },
        city: { label: 'Ville', required: false },
        postalCode: { label: 'Code postal', required: false }
      };
    } else {
      return {
        transactionDate: { label: 'Date de transaction', required: true },
        amount: { label: 'Montant', required: true },
        description: { label: 'Description', required: true },
        category: { label: 'Catégorie', required: false },
        accountNumber: { label: 'Numéro de compte', required: false }
      };
    }
  }, [entityType]);

  const unmappedRequiredFields = useMemo(() => {
    return Object.entries(fieldDefinitions)?.filter(([key, def]) => def?.required && !fieldMapping?.[key])?.map(([key, def]) => def?.label);
  }, [fieldDefinitions, fieldMapping]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Étape 2 : Correspondance des champs
      </h2>
      {unmappedRequiredFields?.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Champs obligatoires non mappés
              </p>
              <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
                {unmappedRequiredFields?.map((field, idx) => (
                  <li key={idx}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {Object.entries(fieldDefinitions)?.map(([fieldKey, fieldDef]) => (
          <div key={fieldKey} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {fieldDef?.label}
                {fieldDef?.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
            </div>
            <div>
              <select
                value={fieldMapping?.[fieldKey] || ''}
                onChange={(e) => onMappingChange(fieldKey, e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Sélectionner une colonne --</option>
                {availableColumns?.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
      {parsedData && parsedData?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Aperçu des données (3 premières lignes)
          </h3>
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {availableColumns?.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedData?.slice(0, 3)?.map((row, idx) => (
                  <tr key={idx}>
                    {availableColumns?.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap"
                      >
                        {row?.[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldMappingSection;