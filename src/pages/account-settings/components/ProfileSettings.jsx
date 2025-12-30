import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

import Icon from '../../../components/AppIcon';

const ProfileSettings = () => {
  const [formData, setFormData] = useState({
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@example.fr',
    phone: '+33 6 12 34 56 78',
    jobTitle: 'Directrice Financière',
    language: 'fr',
    timezone: 'Europe/Paris',
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true
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

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.firstName?.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData?.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData?.phone?.match(/^\+?[\d\s-()]+$/)) {
      newErrors.phone = 'Numéro de téléphone invalide';
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
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
          <div className="flex flex-col items-center space-y-4 mb-6 lg:mb-0">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl md:text-4xl font-heading font-semibold">
                MD
              </div>
              <button
                className="absolute bottom-0 right-0 bg-card border-2 border-border rounded-full p-2 hover:bg-muted transition-smooth shadow-elevation-2"
                aria-label="Changer la photo de profil"
              >
                <Icon name="Camera" size={16} color="var(--color-foreground)" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              JPG, PNG ou GIF. Max 2MB.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Prénom"
                type="text"
                name="firstName"
                value={formData?.firstName}
                onChange={handleInputChange}
                error={errors?.firstName}
                required
                placeholder="Entrez votre prénom"
              />
              <Input
                label="Nom"
                type="text"
                name="lastName"
                value={formData?.lastName}
                onChange={handleInputChange}
                error={errors?.lastName}
                required
                placeholder="Entrez votre nom"
              />
            </div>

            <Input
              label="Adresse Email"
              type="email"
              name="email"
              value={formData?.email}
              onChange={handleInputChange}
              error={errors?.email}
              required
              description="Utilisé pour la connexion et les notifications"
              placeholder="votre.email@example.fr"
            />

            <Input
              label="Téléphone"
              type="tel"
              name="phone"
              value={formData?.phone}
              onChange={handleInputChange}
              error={errors?.phone}
              placeholder="+33 6 12 34 56 78"
            />

            <Input
              label="Fonction"
              type="text"
              name="jobTitle"
              value={formData?.jobTitle}
              onChange={handleInputChange}
              placeholder="Votre fonction dans l'entreprise"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Langue
                </label>
                <select
                  name="language"
                  value={formData?.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fuseau Horaire
                </label>
                <select
                  name="timezone"
                  value={formData?.timezone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="America/New_York">America/New York (GMT-5)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                Préférences de Notification
              </h3>
              <div className="space-y-3">
                <Checkbox
                  label="Notifications par email"
                  description="Recevoir des alertes importantes par email"
                  checked={formData?.emailNotifications}
                  onChange={(e) => handleCheckboxChange('emailNotifications', e?.target?.checked)}
                />
                <Checkbox
                  label="Notifications SMS"
                  description="Recevoir des alertes urgentes par SMS"
                  checked={formData?.smsNotifications}
                  onChange={(e) => handleCheckboxChange('smsNotifications', e?.target?.checked)}
                />
                <Checkbox
                  label="Emails marketing"
                  description="Recevoir des conseils et actualités"
                  checked={formData?.marketingEmails}
                  onChange={(e) => handleCheckboxChange('marketingEmails', e?.target?.checked)}
                />
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
      </div>
    </div>
  );
};

export default ProfileSettings;