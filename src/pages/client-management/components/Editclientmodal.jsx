import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const EditClientModal = ({ isOpen, onClose, onSave, client }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    siret: '',
    vatNumber: '',
    billingAddress: '',
    paymentTerms: '30',
    creditLimit: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  // Charger les données du client quand le modal s'ouvre
  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        companyName: client.companyName || '',
        contactName: client.contactName || '',
        email: client.email || '',
        phone: client.phone || '',
        siret: client.siret || '',
        vatNumber: client.vatNumber || '',
        billingAddress: client.billingAddress || '',
        paymentTerms: client.paymentTerms?.replace(' jours', '') || '30',
        creditLimit: client.creditLimit || '',
        status: client.status || 'active'
      });
    }
  }, [client, isOpen]);

  const paymentTermsOptions = [
    { value: '15', label: '15 jours' },
    { value: '30', label: '30 jours' },
    { value: '45', label: '45 jours' },
    { value: '60', label: '60 jours' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.companyName?.trim()) {
      newErrors.companyName = 'Le nom de l\'entreprise est requis';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-150 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-elevation-4 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h3 className="font-heading font-semibold text-lg md:text-xl">Modifier le client</h3>
          <Button variant="ghost" size="icon" iconName="X" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom de l'entreprise"
                type="text"
                placeholder="Ex: SARL Dupont"
                value={formData?.companyName}
                onChange={(e) => handleChange('companyName', e?.target?.value)}
                error={errors?.companyName}
                required
              />

              <Input
                label="Contact principal"
                type="text"
                placeholder="Ex: Jean Dupont"
                value={formData?.contactName}
                onChange={(e) => handleChange('contactName', e?.target?.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="contact@entreprise.fr"
                value={formData?.email}
                onChange={(e) => handleChange('email', e?.target?.value)}
                error={errors?.email}
                required
              />

              <Input
                label="Téléphone"
                type="tel"
                placeholder="01 23 45 67 89"
                value={formData?.phone}
                onChange={(e) => handleChange('phone', e?.target?.value)}
                error={errors?.phone}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SIRET"
                type="text"
                placeholder="123 456 789 00012"
                value={formData?.siret}
                onChange={(e) => handleChange('siret', e?.target?.value)}
                description="14 chiffres"
              />

              <Input
                label="Numéro de TVA"
                type="text"
                placeholder="FR12345678901"
                value={formData?.vatNumber}
                onChange={(e) => handleChange('vatNumber', e?.target?.value)}
              />
            </div>

            <Input
              label="Adresse de facturation"
              type="text"
              placeholder="123 Rue de la République, 75001 Paris"
              value={formData?.billingAddress}
              onChange={(e) => handleChange('billingAddress', e?.target?.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Statut"
                options={statusOptions}
                value={formData?.status}
                onChange={(value) => handleChange('status', value)}
              />

              <Select
                label="Délai de paiement"
                options={paymentTermsOptions}
                value={formData?.paymentTerms}
                onChange={(value) => handleChange('paymentTerms', value)}
              />
            </div>
          </div>
        </form>

        <div className="flex flex-col sm:flex-row gap-3 p-4 md:p-6 border-t border-border bg-muted/30">
          <Button variant="outline" fullWidth onClick={onClose}>
            Annuler
          </Button>
          <Button variant="default" fullWidth iconName="Save" iconPosition="left" onClick={handleSubmit}>
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditClientModal;