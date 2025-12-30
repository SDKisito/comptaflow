import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import FileUploadSection from './components/FileUploadSection';
import FieldMappingSection from './components/FieldMappingSection';
import ValidationSection from './components/ValidationSection';
import ImportProgressSection from './components/ImportProgressSection';
import { dataImportService } from '../../services/dataImportService';

const DataImport = () => {
  const navigate = useNavigate();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [entityType, setEntityType] = useState('invoices');
  const [fieldMapping, setFieldMapping] = useState({});
  const [validationResults, setValidationResults] = useState({ valid: false, errors: [], warnings: [], summary: {} });
  const [importProgress, setImportProgress] = useState({
    status: 'pending',
    progress: 0,
    totalRows: 0,
    processedRows: 0,
    successfulRows: 0,
    failedRows: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parse file
  const parseFile = useCallback(async (file) => {
    setLoading(true);
    setError('');
    
    try {
      if (file?.type === 'text/csv') {
        Papa?.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setParsedData(results?.data);
            setLoading(false);
            setCurrentStep(2);
          },
          error: (err) => {
            setError(`Erreur de parsing CSV: ${err?.message}`);
            setLoading(false);
          }
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX?.read(data, { type: 'array' });
            const firstSheet = workbook?.Sheets?.[workbook?.SheetNames?.[0]];
            const jsonData = XLSX?.utils?.sheet_to_json(firstSheet);
            setParsedData(jsonData);
            setLoading(false);
            setCurrentStep(2);
          } catch (err) {
            setError(`Erreur de parsing Excel: ${err?.message}`);
            setLoading(false);
          }
        };
        reader?.readAsArrayBuffer(file);
      }
    } catch (err) {
      setError(`Erreur lors de la lecture du fichier: ${err?.message}`);
      setLoading(false);
    }
  }, []);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    parseFile(file);
  }, [parseFile]);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setParsedData([]);
    setFieldMapping({});
    setCurrentStep(1);
  }, []);

  const handleMappingChange = useCallback((fieldKey, columnName) => {
    setFieldMapping(prev => ({
      ...prev,
      [fieldKey]: columnName
    }));
  }, []);

  // Validate data
  const validateData = useCallback(() => {
    const errors = [];
    const warnings = [];
    let validRows = 0;

    parsedData?.forEach((row, idx) => {
      let rowValid = true;

      // Check required fields based on entity type
      if (entityType === 'invoices') {
        if (!fieldMapping?.invoiceNumber || !row?.[fieldMapping?.invoiceNumber]) {
          errors?.push({ row: idx + 1, field: 'Numéro de facture', message: 'Champ obligatoire manquant' });
          rowValid = false;
        }
        if (!fieldMapping?.issueDate || !row?.[fieldMapping?.issueDate]) {
          errors?.push({ row: idx + 1, field: 'Date émission', message: 'Champ obligatoire manquant' });
          rowValid = false;
        }
        if (!fieldMapping?.subtotal || !row?.[fieldMapping?.subtotal]) {
          errors?.push({ row: idx + 1, field: 'Montant HT', message: 'Champ obligatoire manquant' });
          rowValid = false;
        }
        
        // Validate SIRET if present
        if (fieldMapping?.siret && row?.[fieldMapping?.siret]) {
          const siret = row?.[fieldMapping?.siret]?.toString()?.replace(/\s/g, '');
          if (siret && !/^\d{14}$/?.test(siret)) {
            warnings?.push({ row: idx + 1, field: 'SIRET', message: 'Format SIRET invalide (14 chiffres attendus)' });
          }
        }
      } else if (entityType === 'clients') {
        if (!fieldMapping?.email || !row?.[fieldMapping?.email]) {
          errors?.push({ row: idx + 1, field: 'Email', message: 'Champ obligatoire manquant' });
          rowValid = false;
        } else {
          const email = row?.[fieldMapping?.email];
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(email)) {
            errors?.push({ row: idx + 1, field: 'Email', message: 'Format email invalide', value: email });
            rowValid = false;
          }
        }
      } else {
        if (!fieldMapping?.transactionDate || !row?.[fieldMapping?.transactionDate]) {
          errors?.push({ row: idx + 1, field: 'Date', message: 'Champ obligatoire manquant' });
          rowValid = false;
        }
        if (!fieldMapping?.amount || !row?.[fieldMapping?.amount]) {
          errors?.push({ row: idx + 1, field: 'Montant', message: 'Champ obligatoire manquant' });
          rowValid = false;
        }
      }

      if (rowValid) validRows++;
    });

    setValidationResults({
      valid: errors?.length === 0,
      errors,
      warnings,
      summary: {
        validRows,
        totalRows: parsedData?.length
      }
    });

    if (errors?.length === 0) {
      setCurrentStep(3);
    }
  }, [parsedData, fieldMapping, entityType]);

  // Process import
  const processImport = useCallback(async () => {
    setImportProgress(prev => ({ ...prev, status: 'processing', totalRows: parsedData?.length }));
    
    try {
      // Upload file first
      const { data: { user } } = await dataImportService?.supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const filePath = await dataImportService?.uploadFile(selectedFile, user?.id);
      
      // Create import record
      const importRecord = await dataImportService?.createImport({
        entityType,
        fileName: selectedFile?.name,
        filePath,
        fileSize: selectedFile?.size,
        totalRows: parsedData?.length,
        fieldMapping
      });

      // Transform data based on mapping
      const transformedData = parsedData?.map(row => {
        const transformed = {};
        Object.entries(fieldMapping)?.forEach(([fieldKey, columnName]) => {
          if (columnName && row?.[columnName] !== undefined) {
            transformed[fieldKey] = row?.[columnName];
          }
        });
        return transformed;
      });

      let successCount = 0;
      let failCount = 0;

      // Import in batches
      const batchSize = 50;
      for (let i = 0; i < transformedData?.length; i += batchSize) {
        const batch = transformedData?.slice(i, i + batchSize);
        
        try {
          if (entityType === 'invoices') {
            await dataImportService?.bulkCreateInvoices(batch);
          } else if (entityType === 'clients') {
            await dataImportService?.bulkCreateClients(batch);
          } else {
            await dataImportService?.bulkCreateExpenses(batch);
          }
          successCount += batch?.length;
        } catch (err) {
          failCount += batch?.length;
        }

        const progress = ((i + batch?.length) / transformedData?.length) * 100;
        setImportProgress(prev => ({
          ...prev,
          progress,
          processedRows: i + batch?.length,
          successfulRows: successCount,
          failedRows: failCount
        }));
      }

      // Update import record
      await dataImportService?.updateImportStatus(importRecord?.id, 'completed', {
        successfulRows: successCount,
        failedRows: failCount,
        completedAt: new Date()?.toISOString()
      });

      setImportProgress(prev => ({ ...prev, status: 'completed' }));
      setCurrentStep(4);
    } catch (err) {
      setError(`Erreur lors de l'importation: ${err?.message}`);
      setImportProgress(prev => ({ ...prev, status: 'failed' }));
    }
  }, [parsedData, selectedFile, entityType, fieldMapping]);

  const handleStartOver = useCallback(() => {
    setSelectedFile(null);
    setParsedData([]);
    setFieldMapping({});
    setValidationResults({ valid: false, errors: [], warnings: [], summary: {} });
    setImportProgress({
      status: 'pending',
      progress: 0,
      totalRows: 0,
      processedRows: 0,
      successfulRows: 0,
      failedRows: 0
    });
    setCurrentStep(1);
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Importation de données
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Migrez vos données depuis des fichiers CSV ou Excel
                </p>
              </div>
            </div>
            {currentStep === 4 && importProgress?.status === 'completed' && (
              <button
                onClick={handleStartOver}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Nouvelle importation
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Entity type selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de données à importer
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setEntityType('invoices')}
              disabled={currentStep > 1}
              className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
                entityType === 'invoices' ?'bg-indigo-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${currentStep > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Factures
            </button>
            <button
              onClick={() => setEntityType('clients')}
              disabled={currentStep > 1}
              className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
                entityType === 'clients' ?'bg-indigo-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${currentStep > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Clients
            </button>
            <button
              onClick={() => setEntityType('expenses')}
              disabled={currentStep > 1}
              className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
                entityType === 'expenses' ?'bg-indigo-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${currentStep > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Dépenses
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-6">
          {/* Step 1: Upload */}
          {currentStep >= 1 && (
            <FileUploadSection
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClearFile={handleClearFile}
            />
          )}

          {/* Step 2: Mapping */}
          {currentStep >= 2 && parsedData?.length > 0 && (
            <FieldMappingSection
              parsedData={parsedData}
              entityType={entityType}
              fieldMapping={fieldMapping}
              onMappingChange={handleMappingChange}
              requiredFields={[]}
            />
          )}

          {/* Step 3: Validation */}
          {currentStep >= 3 && (
            <ValidationSection
              validationResults={validationResults}
              onFixError={() => {}}
            />
          )}

          {/* Step 4: Import */}
          {currentStep >= 4 && (
            <ImportProgressSection
              status={importProgress?.status}
              progress={importProgress?.progress}
              totalRows={importProgress?.totalRows}
              processedRows={importProgress?.processedRows}
              successfulRows={importProgress?.successfulRows}
              failedRows={importProgress?.failedRows}
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          {currentStep === 2 && (
            <button
              onClick={validateData}
              disabled={Object.keys(fieldMapping)?.length === 0}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Valider les données
            </button>
          )}

          {currentStep === 3 && validationResults?.valid && (
            <button
              onClick={processImport}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Démarrer l'importation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImport;