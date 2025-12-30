import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const DateRangeSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  customStartDate, 
  customEndDate, 
  onCustomDateChange 
}) => {
  const periodOptions = [
    { value: 'current_month', label: 'Mois en cours' },
    { value: 'last_month', label: 'Mois dernier' },
    { value: 'current_quarter', label: 'Trimestre en cours' },
    { value: 'last_quarter', label: 'Trimestre dernier' },
    { value: 'current_year', label: 'Année en cours' },
    { value: 'last_year', label: 'Année dernière' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  return (
    <div className="space-y-4">
      <Select
        label="Période de rapport"
        options={periodOptions}
        value={selectedPeriod}
        onChange={onPeriodChange}
        className="w-full"
      />
      {selectedPeriod === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <Input
            type="date"
            label="Date de début"
            value={customStartDate}
            onChange={(e) => onCustomDateChange('start', e?.target?.value)}
            required
          />
          <Input
            type="date"
            label="Date de fin"
            value={customEndDate}
            onChange={(e) => onCustomDateChange('end', e?.target?.value)}
            required
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;