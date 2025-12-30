import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

const FileUploadSection = ({ onFileSelect, selectedFile, onClearFile, acceptedFormats = '.csv,.xlsx,.xls' }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);

    const files = e?.dataTransfer?.files;
    if (files && files?.length > 0) {
      const file = files?.[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e) => {
    const file = e?.target?.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const validateFile = (file) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes?.includes(file?.type)) {
      alert('Veuillez sélectionner un fichier CSV ou Excel (.xlsx, .xls)');
      return false;
    }

    if (file?.size > maxSize) {
      alert('Le fichier ne doit pas dépasser 10 Mo');
      return false;
    }

    return true;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes?.[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Étape 1 : Téléchargement du fichier
      </h2>
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-50' :'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Glissez-déposez votre fichier ici
            </p>
            <p className="text-sm text-gray-500">ou</p>
            <label className="inline-block">
              <input
                type="file"
                className="sr-only"
                accept={acceptedFormats}
                onChange={handleFileInput}
              />
              <span className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer inline-block transition-colors">
                Parcourir les fichiers
              </span>
            </label>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Formats acceptés : CSV, Excel (.xlsx, .xls) - Max 10 Mo
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <FileText className="h-8 w-8 text-indigo-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile?.size)}
                </p>
              </div>
            </div>
            <button
              onClick={onClearFile}
              className="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Supprimer le fichier"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;