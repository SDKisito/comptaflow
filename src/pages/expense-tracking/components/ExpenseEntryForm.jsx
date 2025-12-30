import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExpenseEntryForm = ({ onSubmit, onCancel, editingExpense = null }) => {
  const [formData, setFormData] = useState({
    amount: editingExpense?.amount || '',
    date: editingExpense?.date || new Date()?.toISOString()?.split('T')?.[0],
    category: editingExpense?.category || '',
    description: editingExpense?.description || '',
    tvaRate: editingExpense?.tvaRate || '20',
    isDeductible: editingExpense?.isDeductible || true,
    receipt: null
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(editingExpense?.receiptName || null);
  const [errors, setErrors] = useState({});

  const categoryOptions = [
    { value: 'fournitures', label: 'Fournitures de bureau', description: 'Papeterie, matériel informatique' },
    { value: 'loyer', label: 'Loyer et charges', description: 'Location de locaux professionnels' },
    { value: 'transport', label: 'Frais de transport', description: 'Déplacements professionnels' },
    { value: 'repas', label: 'Repas et restauration', description: 'Frais de repas professionnels' },
    { value: 'telecom', label: 'Télécommunications', description: 'Téléphone, internet, abonnements' },
    { value: 'marketing', label: 'Marketing et publicité', description: 'Campagnes, communication' },
    { value: 'formation', label: 'Formation professionnelle', description: 'Cours, séminaires, certifications' },
    { value: 'assurance', label: 'Assurances', description: 'Assurances professionnelles' },
    { value: 'honoraires', label: 'Honoraires', description: 'Comptable, avocat, consultant' },
    { value: 'maintenance', label: 'Maintenance et réparations', description: 'Entretien du matériel' },
    { value: 'abonnements', label: 'Abonnements logiciels', description: 'SaaS, licences' },
    { value: 'autres', label: 'Autres dépenses', description: 'Dépenses diverses' }
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

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);

    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFile(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFile(e?.target?.files?.[0]);
    }
  };

  const handleFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes?.includes(file?.type)) {
      setErrors(prev => ({ ...prev, receipt: 'Format non supporté. Utilisez JPG, PNG ou PDF.' }));
      return;
    }

    if (file?.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, receipt: 'Le fichier doit faire moins de 5 Mo.' }));
      return;
    }

    setUploadedFile(file?.name);
    setFormData(prev => ({ ...prev, receipt: file }));
    setErrors(prev => ({ ...prev, receipt: '' }));
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFormData(prev => ({ ...prev, receipt: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.amount || parseFloat(formData?.amount) <= 0) {
      newErrors.amount = 'Montant requis et doit être supérieur à 0';
    }

    if (!formData?.date) {
      newErrors.date = 'Date requise';
    }

    if (!formData?.category) {
      newErrors.category = 'Catégorie requise';
    }

    if (!formData?.description || formData?.description?.trim()?.length < 3) {
      newErrors.description = 'Description requise (minimum 3 caractères)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      const tvaAmount = (parseFloat(formData?.amount) * parseFloat(formData?.tvaRate)) / 100;
      const totalAmount = parseFloat(formData?.amount) + tvaAmount;

      onSubmit({
        ...formData,
        tvaAmount: tvaAmount?.toFixed(2),
        totalAmount: totalAmount?.toFixed(2),
        receiptName: uploadedFile,
        id: editingExpense?.id || Date.now()
      });
    }
  };

  const calculateTVA = () => {
    if (formData?.amount && formData?.tvaRate) {
      const tva = (parseFloat(formData?.amount) * parseFloat(formData?.tvaRate)) / 100;
      return tva?.toFixed(2);
    }
    return '0.00';
  };

  const calculateTotal = () => {
    if (formData?.amount && formData?.tvaRate) {
      const total = parseFloat(formData?.amount) + (parseFloat(formData?.amount) * parseFloat(formData?.tvaRate)) / 100;
      return total?.toFixed(2);
    }
    return '0.00';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-elevation-2">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
          {editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}
        </h2>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="Fermer le formulaire"
          >
            <Icon name="X" size={20} color="var(--color-foreground)" />
          </Button>
        )}
      </div>
      <div className="space-y-4 md:space-y-5">
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

          <Input
            label="Date"
            type="date"
            value={formData?.date}
            onChange={(e) => handleChange('date', e?.target?.value)}
            error={errors?.date}
            required
            max={new Date()?.toISOString()?.split('T')?.[0]}
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
          searchable
        />

        <Input
          label="Description"
          type="text"
          placeholder="Décrivez la dépense..."
          value={formData?.description}
          onChange={(e) => handleChange('description', e?.target?.value)}
          error={errors?.description}
          required
          minLength={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Taux de TVA"
            options={tvaRateOptions}
            value={formData?.tvaRate}
            onChange={(value) => handleChange('tvaRate', value)}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Calculs automatiques</label>
            <div className="bg-muted rounded-md p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Montant HT:</span>
                <span className="font-medium text-foreground">{formData?.amount || '0.00'} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA ({formData?.tvaRate}%):</span>
                <span className="font-medium text-foreground">{calculateTVA()} €</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-border pt-1">
                <span className="text-foreground">Total TTC:</span>
                <span className="text-primary">{calculateTotal()} €</span>
              </div>
            </div>
          </div>
        </div>

        <Checkbox
          label="Dépense déductible fiscalement"
          description="Cette dépense peut être déduite de votre résultat imposable"
          checked={formData?.isDeductible}
          onChange={(e) => handleChange('isDeductible', e?.target?.checked)}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Justificatif (facultatif)
          </label>
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 md:p-8 text-center
              transition-smooth cursor-pointer
              ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('receipt-upload')?.click()}
          >
            <input
              id="receipt-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileInput}
            />

            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                <Icon name="FileCheck" size={24} color="var(--color-success)" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{uploadedFile}</p>
                  <p className="text-xs text-muted-foreground">Fichier téléchargé avec succès</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e?.stopPropagation();
                    removeFile();
                  }}
                  aria-label="Supprimer le fichier"
                >
                  <Icon name="Trash2" size={18} color="var(--color-destructive)" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Icon name="Upload" size={32} color="var(--color-muted-foreground)" className="mx-auto" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Glissez-déposez votre justificatif ici
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ou cliquez pour parcourir (JPG, PNG, PDF - max 5 Mo)
                  </p>
                </div>
              </div>
            )}
          </div>
          {errors?.receipt && (
            <p className="text-sm text-destructive mt-1">{errors?.receipt}</p>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              fullWidth
              className="sm:w-auto"
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            variant="default"
            iconName="Save"
            iconPosition="left"
            fullWidth
            className="sm:flex-1"
          >
            {editingExpense ? 'Mettre à jour' : 'Enregistrer la dépense'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ExpenseEntryForm;