import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const SecuritySettings = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const activeSessions = [
    {
      id: 1,
      device: 'Windows PC - Chrome',
      location: 'Paris, France',
      ip: '192.168.1.1',
      lastActive: '24/12/2024 09:15',
      isCurrent: true
    },
    {
      id: 2,
      device: 'iPhone 14 - Safari',
      location: 'Lyon, France',
      ip: '192.168.1.45',
      lastActive: '23/12/2024 18:30',
      isCurrent: false
    },
    {
      id: 3,
      device: 'MacBook Pro - Firefox',
      location: 'Marseille, France',
      ip: '192.168.1.89',
      lastActive: '22/12/2024 14:20',
      isCurrent: false
    }
  ];

  const loginHistory = [
    {
      id: 1,
      date: '24/12/2024 09:15',
      device: 'Windows PC',
      location: 'Paris, France',
      status: 'success'
    },
    {
      id: 2,
      date: '23/12/2024 18:30',
      device: 'iPhone 14',
      location: 'Lyon, France',
      status: 'success'
    },
    {
      id: 3,
      date: '22/12/2024 14:20',
      device: 'MacBook Pro',
      location: 'Marseille, France',
      status: 'success'
    },
    {
      id: 4,
      date: '21/12/2024 22:45',
      device: 'Unknown Device',
      location: 'Berlin, Germany',
      status: 'failed'
    }
  ];

  const handlePasswordChange = (e) => {
    const { name, value } = e?.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData?.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }
    if (!passwordData?.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwordData?.newPassword?.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    return newErrors;
  };

  const handlePasswordSubmit = (e) => {
    e?.preventDefault();
    const newErrors = validatePasswordForm();
    
    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordChangeSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordChangeSuccess(false), 3000);
    }, 1500);
  };

  const handleTerminateSession = (sessionId) => {
    console.log('Terminating session:', sessionId);
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? (
      <Icon name="CheckCircle" size={16} color="var(--color-success)" />
    ) : (
      <Icon name="XCircle" size={16} color="var(--color-error)" />
    );
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Changer le Mot de Passe
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Mot de Passe Actuel"
            type="password"
            name="currentPassword"
            value={passwordData?.currentPassword}
            onChange={handlePasswordChange}
            error={errors?.currentPassword}
            required
            placeholder="Entrez votre mot de passe actuel"
          />
          <Input
            label="Nouveau Mot de Passe"
            type="password"
            name="newPassword"
            value={passwordData?.newPassword}
            onChange={handlePasswordChange}
            error={errors?.newPassword}
            required
            description="Minimum 8 caractères, incluant majuscules, minuscules et chiffres"
            placeholder="Entrez un nouveau mot de passe"
          />
          <Input
            label="Confirmer le Nouveau Mot de Passe"
            type="password"
            name="confirmPassword"
            value={passwordData?.confirmPassword}
            onChange={handlePasswordChange}
            error={errors?.confirmPassword}
            required
            placeholder="Confirmez votre nouveau mot de passe"
          />
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              variant="default"
              loading={isChangingPassword}
              iconName={passwordChangeSuccess ? 'Check' : undefined}
              iconPosition="left"
              className="sm:w-auto"
            >
              {passwordChangeSuccess ? 'Mot de passe modifié' : 'Changer le mot de passe'}
            </Button>
          </div>
        </form>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Authentification à Deux Facteurs (2FA)
        </h3>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez une couche de sécurité supplémentaire à votre compte en activant l'authentification à deux facteurs. Vous recevrez un code de vérification par SMS ou application d'authentification à chaque connexion.
            </p>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e?.target?.checked)}
                label="Activer l'authentification à deux facteurs"
              />
            </div>
          </div>
          {twoFactorEnabled && (
            <Button variant="outline" iconName="Smartphone" iconPosition="left">
              Configurer 2FA
            </Button>
          )}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Sessions Actives
        </h3>
        <div className="space-y-4">
          {activeSessions?.map((session) => (
            <div
              key={session?.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg"
            >
              <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name="Monitor" size={20} color="var(--color-foreground)" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-foreground">{session?.device}</span>
                    {session?.isCurrent && (
                      <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-md">
                        Session actuelle
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session?.location} • {session?.ip}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dernière activité: {session?.lastActive}
                  </p>
                </div>
              </div>
              {!session?.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="LogOut"
                  onClick={() => handleTerminateSession(session?.id)}
                >
                  Déconnecter
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="destructive" iconName="LogOut" iconPosition="left">
            Déconnecter toutes les autres sessions
          </Button>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Historique de Connexion
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Date & Heure
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Appareil
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Localisation
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {loginHistory?.map((login) => (
                <tr key={login?.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 text-sm text-foreground">
                    {login?.date}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {login?.device}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {login?.location}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusIcon(login?.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Icon name="AlertTriangle" size={24} color="var(--color-warning)" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-heading font-semibold text-foreground mb-2">
              Activité Suspecte Détectée
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Une tentative de connexion échouée a été détectée depuis Berlin, Germany le 21/12/2024. Si ce n'était pas vous, nous vous recommandons de changer immédiatement votre mot de passe.
            </p>
            <Button variant="outline" iconName="Shield">
              Sécuriser mon compte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;