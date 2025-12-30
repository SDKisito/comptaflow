import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SearchBar = ({ searchQuery, onSearchChange, sortBy, onSortChange }) => {
  const sortOptions = [
    { value: 'name', label: 'Nom (A-Z)' },
    { value: 'balance', label: 'Solde (Décroissant)' },
    { value: 'activity', label: 'Activité récente' },
    { value: 'created', label: 'Date de création' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
      <div className="flex-1">
        <div className="relative">
          <Icon
            name="Search"
            size={18}
            color="var(--color-muted-foreground)"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <Input
            type="search"
            placeholder="Rechercher par nom, email, SIRET..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="w-full lg:w-64">
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={onSortChange}
          placeholder="Trier par..."
        />
      </div>
    </div>
  );
};

export default SearchBar;