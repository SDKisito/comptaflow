import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DeclarationPreparationModal = ({ declaration, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    period: declaration?.period || '',
    revenue: '',
    expenses: '',
    tvaCollected: '',
    tvaDeductible: '',
    notes: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const periodOptions = [
    { value: 'Q1-2024', label: 'T1 2024 (Janvier - Mars)' },
    { value: 'Q2-2024', label: 'T2 2024 (Avril - Juin)' },
    { value: 'Q3-2024', label: 'T3 2024 (Juillet - Septembre)' },
    { value: 'Q4-2024', label: 'T4 2024 (Octobre - Décembre)' }
  ];

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-background bg-opacity-80">
      <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div>
            <h2 className="font-heading font-semibold text-lg md:text-xl text-foreground">
              Préparer la déclaration
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {declaration?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-smooth"
            aria-label="Fermer"
          >
            <Icon name="X" size={20} color="var(--color-foreground)" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3]?.map((step) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full
                        transition-smooth
                        ${currentStep >= step
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {currentStep > step ? (
                        <Icon name="Check" size={16} color="var(--color-primary-foreground)" />
                      ) : (
                        <span className="font-medium text-sm">{step}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 hidden sm:block">
                      {step === 1 ? 'Période' : step === 2 ? 'Montants' : 'Révision'}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={`
                        flex-1 h-1 mx-2 rounded-full transition-smooth
                        ${currentStep > step ? 'bg-primary' : 'bg-muted'}
                      `}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <Select
                label="Période de déclaration"
                description="Sélectionnez la période fiscale"
                options={periodOptions}
                value={formData?.period}
                onChange={(value) => handleInputChange('period', value)}
                required
              />
              <Input
                label="Chiffre d'affaires"
                type="number"
                placeholder="0,00"
                value={formData?.revenue}
                onChange={(e) => handleInputChange('revenue', e?.target?.value)}
                description="Montant total des ventes HT"
                required
              />
              <Input
                label="Charges déductibles"
                type="number"
                placeholder="0,00"
                value={formData?.expenses}
                onChange={(e) => handleInputChange('expenses', e?.target?.value)}
                description="Total des dépenses professionnelles"
                required
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Input
                label="TVA collectée"
                type="number"
                placeholder="0,00"
                value={formData?.tvaCollected}
                onChange={(e) => handleInputChange('tvaCollected', e?.target?.value)}
                description="TVA facturée aux clients"
                required
              />
              <Input
                label="TVA déductible"
                type="number"
                placeholder="0,00"
                value={formData?.tvaDeductible}
                onChange={(e) => handleInputChange('tvaDeductible', e?.target?.value)}
                description="TVA payée sur les achats"
                required
              />
              <div className="p-4 bg-muted rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">TVA à payer</span>
                  <span className="font-heading font-semibold text-lg text-foreground data-text">
                    {((parseFloat(formData?.tvaCollected) || 0) - (parseFloat(formData?.tvaDeductible) || 0))?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <h4 className="font-heading font-semibold text-base text-foreground mb-3">
                  Récapitulatif de la déclaration
                </h4>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Période</span>
                  <span className="text-sm font-medium text-foreground">{formData?.period}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Chiffre d'affaires</span>
                  <span className="text-sm font-medium text-foreground data-text">
                    {parseFloat(formData?.revenue || 0)?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Charges</span>
                  <span className="text-sm font-medium text-foreground data-text">
                    {parseFloat(formData?.expenses || 0)?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">TVA collectée</span>
                  <span className="text-sm font-medium text-foreground data-text">
                    {parseFloat(formData?.tvaCollected || 0)?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">TVA déductible</span>
                  <span className="text-sm font-medium text-foreground data-text">
                    {parseFloat(formData?.tvaDeductible || 0)?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 bg-primary bg-opacity-10 px-3 rounded-md mt-3">
                  <span className="font-medium text-sm text-foreground">TVA à payer</span>
                  <span className="font-heading font-semibold text-lg text-primary data-text">
                    {((parseFloat(formData?.tvaCollected) || 0) - (parseFloat(formData?.tvaDeductible) || 0))?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
              <Input
                label="Notes additionnelles (optionnel)"
                type="text"
                placeholder="Ajoutez des notes ou commentaires"
                value={formData?.notes}
                onChange={(e) => handleInputChange('notes', e?.target?.value)}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-4 md:p-6 border-t border-border">
          <Button
            variant="outline"
            size="default"
            onClick={currentStep === 1 ? onClose : handlePrevious}
            iconName={currentStep === 1 ? 'X' : 'ChevronLeft'}
            iconPosition="left"
          >
            {currentStep === 1 ? 'Annuler' : 'Précédent'}
          </Button>
          <Button
            variant="default"
            size="default"
            onClick={currentStep === totalSteps ? handleSubmit : handleNext}
            iconName={currentStep === totalSteps ? 'Check' : 'ChevronRight'}
            iconPosition="right"
          >
            {currentStep === totalSteps ? 'Soumettre' : 'Suivant'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeclarationPreparationModal;