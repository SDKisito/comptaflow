import React from 'react';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onApply, 
  onReset 
}) => {
  const accountCategoryOptions = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'revenue', label: 'Produits' },
    { value: 'expenses', label: 'Charges' },
    { value: 'assets', label: 'Actifs' },
    { value: 'liabilities', label: 'Passifs' },
    { value: 'equity', label: 'Capitaux propres' }
  ];

  const businessUnitOptions = [
    { value: 'all', label: 'Toutes les unités' },
    { value: 'unit_1', label: 'Unité Paris' },
    { value: 'unit_2', label: 'Unité Lyon' },
    { value: 'unit_3', label: 'Unité Marseille' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
      <h3 className="font-heading font-semibold text-base md:text-lg mb-4">Filtres avancés</h3>
      <Select
        label="Catégorie de compte"
        options={accountCategoryOptions}
        value={filters?.accountCategory}
        onChange={(value) => onFilterChange('accountCategory', value)}
      />
      <Select
        label="Unité d'affaires"
        options={businessUnitOptions}
        value={filters?.businessUnit}
        onChange={(value) => onFilterChange('businessUnit', value)}
      />
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground mb-2">Options d'affichage</p>
        <Checkbox
          label="Afficher les comptes à zéro"
          checked={filters?.showZeroAccounts}
          onChange={(e) => onFilterChange('showZeroAccounts', e?.target?.checked)}
        />
        <Checkbox
          label="Regrouper par catégorie"
          checked={filters?.groupByCategory}
          onChange={(e) => onFilterChange('groupByCategory', e?.target?.checked)}
        />
        <Checkbox
          label="Afficher les sous-totaux"
          checked={filters?.showSubtotals}
          onChange={(e) => onFilterChange('showSubtotals', e?.target?.checked)}
        />
      </div>
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          variant="default"
          onClick={onApply}
          fullWidth
        >
          Appliquer
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          fullWidth
        >
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;