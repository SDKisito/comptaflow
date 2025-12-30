import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';


const InvoiceFilterPanel = ({ filters, onFilterChange, onReset }) => {
  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'Brouillon', label: 'Brouillon' },
    { value: 'Envoyée', label: 'Envoyée' },
    { value: 'Payée', label: 'Payée' },
    { value: 'En retard', label: 'En retard' },
    { value: 'Partiellement payée', label: 'Partiellement payée' }
  ];

  const clientOptions = [
    { value: 'all', label: 'Tous les clients' },
    { value: 'client1', label: 'Entreprise Martin SARL' },
    { value: 'client2', label: 'Société Dupont & Fils' },
    { value: 'client3', label: 'Cabinet Lefebvre' },
    { value: 'client4', label: 'Boutique Bernard' },
    { value: 'client5', label: 'Restaurant Le Gourmet' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-base md:text-lg text-foreground">
          Filtres de recherche
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          iconName="RotateCcw"
          iconPosition="left"
        >
          Réinitialiser
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="text"
          label="Numéro de facture"
          placeholder="Ex: FAC-2024-001"
          value={filters?.invoiceNumber}
          onChange={(e) => onFilterChange('invoiceNumber', e?.target?.value)}
        />

        <Select
          label="Client"
          options={clientOptions}
          value={filters?.client}
          onChange={(value) => onFilterChange('client', value)}
          searchable
        />

        <Select
          label="Statut"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Input
          type="date"
          label="Date de début"
          value={filters?.startDate}
          onChange={(e) => onFilterChange('startDate', e?.target?.value)}
        />

        <Input
          type="date"
          label="Date de fin"
          value={filters?.endDate}
          onChange={(e) => onFilterChange('endDate', e?.target?.value)}
        />

        <Input
          type="number"
          label="Montant minimum (€)"
          placeholder="0.00"
          value={filters?.minAmount}
          onChange={(e) => onFilterChange('minAmount', e?.target?.value)}
        />

        <Input
          type="number"
          label="Montant maximum (€)"
          placeholder="10000.00"
          value={filters?.maxAmount}
          onChange={(e) => onFilterChange('maxAmount', e?.target?.value)}
        />

        <div className="flex items-end">
          <Input
            type="search"
            label="Recherche globale"
            placeholder="Rechercher..."
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilterPanel;
