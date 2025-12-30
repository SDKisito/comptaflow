import React from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ExpenseFilters = ({ filters, onFilterChange, onReset, onExport }) => {
  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'fournitures', label: 'Fournitures de bureau' },
    { value: 'loyer', label: 'Loyer et charges' },
    { value: 'transport', label: 'Frais de transport' },
    { value: 'repas', label: 'Repas et restauration' },
    { value: 'telecom', label: 'Télécommunications' },
    { value: 'marketing', label: 'Marketing et publicité' },
    { value: 'formation', label: 'Formation professionnelle' },
    { value: 'assurance', label: 'Assurances' },
    { value: 'honoraires', label: 'Honoraires' },
    { value: 'maintenance', label: 'Maintenance et réparations' },
    { value: 'abonnements', label: 'Abonnements logiciels' },
    { value: 'autres', label: 'Autres dépenses' }
  ];

  const deductibilityOptions = [
    { value: '', label: 'Toutes les dépenses' },
    { value: 'deductible', label: 'Déductibles uniquement' },
    { value: 'non-deductible', label: 'Non déductibles uniquement' }
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Date (plus récent)' },
    { value: 'date-asc', label: 'Date (plus ancien)' },
    { value: 'amount-desc', label: 'Montant (décroissant)' },
    { value: 'amount-asc', label: 'Montant (croissant)' },
    { value: 'category', label: 'Catégorie (A-Z)' }
  ];

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const hasActiveFilters = () => {
    return filters?.category || filters?.deductibility || filters?.dateFrom || filters?.dateTo || filters?.search;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
          Filtres et recherche
        </h3>
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconPosition="left"
            onClick={onReset}
          >
            Réinitialiser
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <Input
          type="search"
          placeholder="Rechercher une dépense..."
          value={filters?.search}
          onChange={(e) => handleChange('search', e?.target?.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Catégorie"
            options={categoryOptions}
            value={filters?.category}
            onChange={(value) => handleChange('category', value)}
            searchable
          />

          <Select
            label="Déductibilité"
            options={deductibilityOptions}
            value={filters?.deductibility}
            onChange={(value) => handleChange('deductibility', value)}
          />

          <Select
            label="Trier par"
            options={sortOptions}
            value={filters?.sortBy}
            onChange={(value) => handleChange('sortBy', value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date de début"
            type="date"
            value={filters?.dateFrom}
            onChange={(e) => handleChange('dateFrom', e?.target?.value)}
            max={filters?.dateTo || new Date()?.toISOString()?.split('T')?.[0]}
          />

          <Input
            label="Date de fin"
            type="date"
            value={filters?.dateTo}
            onChange={(e) => handleChange('dateTo', e?.target?.value)}
            min={filters?.dateFrom}
            max={new Date()?.toISOString()?.split('T')?.[0]}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
            fullWidth
            className="sm:w-auto"
          >
            Exporter (CSV)
          </Button>
          <Button
            variant="outline"
            iconName="FileSpreadsheet"
            iconPosition="left"
            onClick={() => onExport('excel')}
            fullWidth
            className="sm:w-auto"
          >
            Exporter (Excel)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;