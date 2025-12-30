import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TeamSettings = () => {
  const [teamMembers, setTeamMembers] = useState([
  {
    id: 1,
    name: 'Marie Dubois',
    email: 'marie.dubois@example.fr',
    role: 'owner',
    avatar: null,
    status: 'active',
    lastActive: '24/12/2024 09:15',
    permissions: ['all']
  },
  {
    id: 2,
    name: 'Pierre Martin',
    email: 'pierre.martin@example.fr',
    role: 'admin',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a1e20f1e-1763294981783.png",
    avatarAlt: 'Professional headshot of middle-aged French man with short brown hair wearing navy blue business suit and striped tie',
    status: 'active',
    lastActive: '24/12/2024 08:45',
    permissions: ['invoices', 'expenses', 'reports']
  },
  {
    id: 3,
    name: 'Sophie Laurent',
    email: 'sophie.laurent@example.fr',
    role: 'accountant',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1acd953c0-1763293371113.png",
    avatarAlt: 'Professional portrait of young French woman with long blonde hair in white blouse and black blazer smiling warmly',
    status: 'active',
    lastActive: '23/12/2024 17:30',
    permissions: ['invoices', 'expenses', 'clients']
  },
  {
    id: 4,
    name: 'Thomas Rousseau',
    email: 'thomas.rousseau@example.fr',
    role: 'viewer',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_141303ae1-1763293580727.png",
    avatarAlt: 'Casual headshot of young French man with curly dark hair wearing gray sweater against neutral background',
    status: 'invited',
    lastActive: null,
    permissions: ['reports']
  }]
  );

  const roles = [
  {
    id: 'owner',
    name: 'Propriétaire',
    description: 'Accès complet à toutes les fonctionnalités et paramètres',
    color: 'primary'
  },
  {
    id: 'admin',
    name: 'Administrateur',
    description: 'Gestion complète sauf suppression du compte',
    color: 'secondary'
  },
  {
    id: 'accountant',
    name: 'Comptable',
    description: 'Accès aux fonctions comptables et financières',
    color: 'success'
  },
  {
    id: 'viewer',
    name: 'Lecteur',
    description: 'Consultation uniquement, sans modification',
    color: 'muted'
  }];


  const permissions = [
  { id: 'invoices', label: 'Facturation', icon: 'FileText' },
  { id: 'expenses', label: 'Dépenses', icon: 'Receipt' },
  { id: 'clients', label: 'Clients', icon: 'Users' },
  { id: 'reports', label: 'Rapports', icon: 'BarChart3' },
  { id: 'taxes', label: 'Déclarations', icon: 'FileCheck' },
  { id: 'settings', label: 'Paramètres', icon: 'Settings' }];


  const getRoleBadge = (role) => {
    const roleData = roles?.find((r) => r?.id === role);
    if (!roleData) return null;

    const colorClasses = {
      primary: 'bg-primary/10 text-primary',
      secondary: 'bg-secondary/10 text-secondary',
      success: 'bg-success/10 text-success',
      muted: 'bg-muted text-muted-foreground'
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${colorClasses?.[roleData?.color]}`}>
        {roleData?.name}
      </span>);

  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="flex items-center space-x-1 px-2 py-1 bg-success/10 text-success rounded-md text-xs font-medium">
          <Icon name="CheckCircle" size={14} color="var(--color-success)" />
          <span>Actif</span>
        </span>);

    }
    return (
      <span className="flex items-center space-x-1 px-2 py-1 bg-warning/10 text-warning rounded-md text-xs font-medium">
        <Icon name="Clock" size={14} color="var(--color-warning)" />
        <span>Invitation en attente</span>
      </span>);

  };

  const handleRemoveMember = (memberId) => {
    setTeamMembers((prev) => prev?.filter((member) => member?.id !== memberId));
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
              Membres de l'Équipe
            </h3>
            <p className="text-sm text-muted-foreground">
              Gérez les accès et permissions de votre équipe
            </p>
          </div>
          <Button variant="default" iconName="UserPlus" iconPosition="left" className="mt-4 sm:mt-0">
            Inviter un Membre
          </Button>
        </div>

        <div className="space-y-4">
          {teamMembers?.map((member) =>
          <div
            key={member?.id}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-border rounded-lg">

              <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                {member?.avatar ?
              <Image
                src={member?.avatar}
                alt={member?.avatarAlt}
                className="w-12 h-12 rounded-full object-cover" /> :


              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                    {member?.name?.split(' ')?.map((n) => n?.[0])?.join('')}
                  </div>
              }
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-foreground">{member?.name}</h4>
                    {getRoleBadge(member?.role)}
                    {getStatusBadge(member?.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{member?.email}</p>
                  {member?.lastActive &&
                <p className="text-xs text-muted-foreground">
                      Dernière activité: {member?.lastActive}
                    </p>
                }
                  <div className="flex flex-wrap gap-2 mt-2">
                    {member?.permissions?.includes('all') ?
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                        Tous les accès
                      </span> :

                  member?.permissions?.map((perm) => {
                    const permData = permissions?.find((p) => p?.id === perm);
                    return permData ?
                    <span
                      key={perm}
                      className="px-2 py-1 bg-muted text-foreground text-xs rounded-md">

                            {permData?.label}
                          </span> :
                    null;
                  })
                  }
                  </div>
                </div>
              </div>
              {member?.role !== 'owner' &&
            <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" iconName="Edit">
                    Modifier
                  </Button>
                  <Button
                variant="ghost"
                size="sm"
                iconName="Trash2"
                onClick={() => handleRemoveMember(member?.id)}>

                    Retirer
                  </Button>
                </div>
            }
            </div>
          )}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Rôles et Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {roles?.map((role) =>
          <div
            key={role?.id}
            className="p-4 border border-border rounded-lg">

              <div className="flex items-center justify-between mb-3">
                <h4 className="font-heading font-semibold text-foreground">
                  {role?.name}
                </h4>
                {getRoleBadge(role?.id)}
              </div>
              <p className="text-sm text-muted-foreground">
                {role?.description}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Permissions Disponibles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {permissions?.map((permission) =>
          <div
            key={permission?.id}
            className="flex items-center space-x-3 p-3 border border-border rounded-lg">

              <Icon name={permission?.icon} size={20} color="var(--color-primary)" />
              <span className="text-sm font-medium text-foreground">
                {permission?.label}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Icon name="Info" size={24} color="var(--color-primary)" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-heading font-semibold text-foreground mb-2">
              Limite d'Utilisateurs
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Votre plan Professionnel permet jusqu'à 10 utilisateurs. Vous avez actuellement {teamMembers?.length} membres actifs. Pour ajouter plus d'utilisateurs, passez au plan Entreprise.
            </p>
            <Button variant="outline" iconName="ArrowUpCircle">
              Mettre à Niveau
            </Button>
          </div>
        </div>
      </div>
    </div>);

};

export default TeamSettings;