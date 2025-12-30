import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const ComparisonToggle = ({ 
  isEnabled, 
  onToggle, 
  comparisonPeriod, 
  onComparisonPeriodChange 
}) => {
  const comparisonOptions = [
    { value: 'previous_period', label: 'Période précédente' },
    { value: 'previous_year', label: 'Année précédente' },
    { value: 'budget', label: 'Budget' }
  ];

  return (
    <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
      <Checkbox
        label="Activer la comparaison"
        description="Comparer avec une autre période"
        checked={isEnabled}
        onChange={(e) => onToggle(e?.target?.checked)}
      />
      {isEnabled && (
        <Select
          label="Comparer avec"
          options={comparisonOptions}
          value={comparisonPeriod}
          onChange={onComparisonPeriodChange}
          className="w-full"
        />
      )}
    </div>
  );
};

export default ComparisonToggle;