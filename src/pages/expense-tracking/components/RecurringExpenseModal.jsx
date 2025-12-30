import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const RecurringExpenseModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    frequency: 'monthly',
    startDate: new Date()?.toISOString()?.split('T')?.[0],
    endDate: '',
    tvaRate: '20',
    isDeductible: true,
    autoGenerate: true
  });

  const [errors, setErrors] = useState({});

  const categoryOptions = [
    { value: 'loyer', label: 'Loyer et charges' },
    { value: 'telecom', label: 'Télécommunications' },
    { value: 'assurance', label: 'Assurances' },
    { value: 'abonnements', label: 'Abonnements logiciels' },
    { value: 'autres', label: 'Autres dépenses récurrentes' }
  ];

  const frequencyOptions = [
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'biweekly', label: 'Bimensuel' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'quarterly', label: 'Trimestriel' },
    { value: 'yearly', label: 'Annuel' }
  ];

  const tvaRateOptions = [
    { value: '0', label: '0% - Exonéré' },
    { value: '5.5', label: '5,5% - Taux réduit' },
    { value: '10', label: '10% - Taux intermédiaire' },
    { value: '20', label: '20% - Taux normal' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.description || formData?.description?.trim()?.length < 3) {
      newErrors.description = 'Description requise (minimum 3 caractères)';
    }

    if (!formData?.amount || parseFloat(formData?.amount) <= 0) {
      newErrors.amount = 'Montant requis et doit être supérieur à 0';
    }

    if (!formData?.category) {
      newErrors.category = 'Catégorie requise';
    }

    if (!formData?.startDate) {
      newErrors.startDate = 'Date de début requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
            Configurer une dépense récurrente
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fermer"
          >
            <Icon name="X" size={20} color="var(--color-foreground)" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="space-y-4 md:space-y-5">
            <Input
              label="Description"
              type="text"
              placeholder="Ex: Loyer mensuel bureau"
              value={formData?.description}
              onChange={(e) => handleChange('description', e?.target?.value)}
              error={errors?.description}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Montant HT"
                type="number"
                placeholder="0.00"
                value={formData?.amount}
                onChange={(e) => handleChange('amount', e?.target?.value)}
                error={errors?.amount}
                required
                min="0"
                step="0.01"
              />

              <Select
                label="Taux de TVA"
                options={tvaRateOptions}
                value={formData?.tvaRate}
                onChange={(value) => handleChange('tvaRate', value)}
                required
              />
            </div>

            <Select
              label="Catégorie"
              placeholder="Sélectionner une catégorie"
              options={categoryOptions}
              value={formData?.category}
              onChange={(value) => handleChange('category', value)}
              error={errors?.category}
              required
            />

            <Select
              label="Fréquence"
              options={frequencyOptions}
              value={formData?.frequency}
              onChange={(value) => handleChange('frequency', value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date de début"
                type="date"
                value={formData?.startDate}
                onChange={(e) => handleChange('startDate', e?.target?.value)}
                error={errors?.startDate}
                required
              />

              <Input
                label="Date de fin (facultatif)"
                type="date"
                value={formData?.endDate}
                onChange={(e) => handleChange('endDate', e?.target?.value)}
                min={formData?.startDate}
                description="Laisser vide pour une récurrence illimitée"
              />
            </div>

            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <Checkbox
                label="Dépense déductible fiscalement"
                checked={formData?.isDeductible}
                onChange={(e) => handleChange('isDeductible', e?.target?.checked)}
              />

              <Checkbox
                label="Générer automatiquement les dépenses"
                description="Les dépenses seront créées automatiquement selon la fréquence définie"
                checked={formData?.autoGenerate}
                onChange={(e) => handleChange('autoGenerate', e?.target?.checked)}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                fullWidth
                className="sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="default"
                iconName="Save"
                iconPosition="left"
                fullWidth
                className="sm:flex-1"
              >
                Enregistrer la récurrence
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringExpenseModal;