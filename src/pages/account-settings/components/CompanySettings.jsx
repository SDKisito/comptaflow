import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CompanySettings = () => {
  const [formData, setFormData] = useState({
    companyName: 'Solutions Financières Dubois SARL',
    siret: '123 456 789 00012',
    tvaNumber: 'FR12345678901',
    address: '45 Avenue des Champs-Élysées',
    postalCode: '75008',
    city: 'Paris',
    country: 'France',
    phone: '+33 1 42 56 78 90',
    email: 'contact@sfd-sarl.fr',
    website: 'www.sfd-sarl.fr',
    fiscalYear: '01/01',
    accountingMethod: 'accrual',
    currency: 'EUR'
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.companyName?.trim()) newErrors.companyName = 'Le nom de l\'entreprise est requis';
    if (!formData?.siret?.match(/^\d{3}\s?\d{3}\s?\d{3}\s?\d{5}$/)) {
      newErrors.siret = 'Format SIRET invalide (14 chiffres)';
    }
    if (!formData?.tvaNumber?.match(/^FR\d{11}$/)) {
      newErrors.tvaNumber = 'Format TVA invalide (FR + 11 chiffres)';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              Informations Légales
            </h3>
            <div className="space-y-4">
              <Input
                label="Nom de l'Entreprise"
                type="text"
                name="companyName"
                value={formData?.companyName}
                onChange={handleInputChange}
                error={errors?.companyName}
                required
                placeholder="Nom légal de votre entreprise"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input
                  label="Numéro SIRET"
                  type="text"
                  name="siret"
                  value={formData?.siret}
                  onChange={handleInputChange}
                  error={errors?.siret}
                  required
                  description="14 chiffres"
                  placeholder="123 456 789 00012"
                />
                <Input
                  label="Numéro TVA Intracommunautaire"
                  type="text"
                  name="tvaNumber"
                  value={formData?.tvaNumber}
                  onChange={handleInputChange}
                  error={errors?.tvaNumber}
                  required
                  description="Format: FR + 11 chiffres"
                  placeholder="FR12345678901"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              Adresse du Siège Social
            </h3>
            <div className="space-y-4">
              <Input
                label="Adresse"
                type="text"
                name="address"
                value={formData?.address}
                onChange={handleInputChange}
                required
                placeholder="Numéro et nom de rue"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Input
                  label="Code Postal"
                  type="text"
                  name="postalCode"
                  value={formData?.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="75008"
                />
                <Input
                  label="Ville"
                  type="text"
                  name="city"
                  value={formData?.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Paris"
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Pays
                  </label>
                  <select
                    name="country"
                    value={formData?.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Luxembourg">Luxembourg</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              Coordonnées de Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Téléphone"
                type="tel"
                name="phone"
                value={formData?.phone}
                onChange={handleInputChange}
                placeholder="+33 1 42 56 78 90"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData?.email}
                onChange={handleInputChange}
                placeholder="contact@entreprise.fr"
              />
            </div>
            <div className="mt-4">
              <Input
                label="Site Web"
                type="url"
                name="website"
                value={formData?.website}
                onChange={handleInputChange}
                placeholder="www.entreprise.fr"
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              Paramètres Comptables
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Début d'Exercice Fiscal
                </label>
                <select
                  name="fiscalYear"
                  value={formData?.fiscalYear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="01/01">1er Janvier</option>
                  <option value="04/01">1er Avril</option>
                  <option value="07/01">1er Juillet</option>
                  <option value="10/01">1er Octobre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Méthode Comptable
                </label>
                <select
                  name="accountingMethod"
                  value={formData?.accountingMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="accrual">Comptabilité d'Engagement</option>
                  <option value="cash">Comptabilité de Trésorerie</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Devise
                </label>
                <select
                  name="currency"
                  value={formData?.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CHF">CHF (Fr)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              variant="default"
              loading={isSaving}
              iconName={saveSuccess ? 'Check' : undefined}
              iconPosition="left"
              className="sm:w-auto"
            >
              {saveSuccess ? 'Enregistré' : 'Enregistrer les modifications'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location?.reload()}
              className="sm:w-auto"
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Icon name="AlertCircle" size={24} color="var(--color-warning)" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-heading font-semibold text-foreground mb-2">
              Modification des Informations Légales
            </h4>
            <p className="text-sm text-muted-foreground">
              Les modifications des informations légales (SIRET, TVA) peuvent nécessiter une vérification administrative. Ces changements seront appliqués après validation par notre équipe de conformité dans un délai de 24 à 48 heures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;