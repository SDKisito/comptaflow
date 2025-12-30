import React from 'react';
import Button from '../../../components/ui/Button';

const ExportOptions = ({ onExport, isGenerating }) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        iconName="FileText"
        iconPosition="left"
        onClick={() => onExport('pdf')}
        disabled={isGenerating}
        className="flex-1 md:flex-none"
      >
        Exporter PDF
      </Button>
      <Button
        variant="outline"
        iconName="FileSpreadsheet"
        iconPosition="left"
        onClick={() => onExport('excel')}
        disabled={isGenerating}
        className="flex-1 md:flex-none"
      >
        Exporter Excel
      </Button>
      <Button
        variant="outline"
        iconName="Download"
        iconPosition="left"
        onClick={() => onExport('csv')}
        disabled={isGenerating}
        className="flex-1 md:flex-none"
      >
        Exporter CSV
      </Button>
    </div>
  );
};

export default ExportOptions;