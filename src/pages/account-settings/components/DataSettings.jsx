import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const DataSettings = () => {
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const backupHistory = [
    {
      id: 1,
      date: '24/12/2024 02:00',
      type: 'automatic',
      size: '245 MB',
      status: 'success'
    },
    {
      id: 2,
      date: '23/12/2024 02:00',
      type: 'automatic',
      size: '243 MB',
      status: 'success'
    },
    {
      id: 3,
      date: '22/12/2024 14:30',
      type: 'manual',
      size: '242 MB',
      status: 'success'
    },
    {
      id: 4,
      date: '22/12/2024 02:00',
      type: 'automatic',
      size: '241 MB',
      status: 'success'
    }
  ];

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Format universel pour l\'impression et le partage',
      icon: 'FileText',
      size: 'Moyen'
    },
    {
      id: 'excel',
      name: 'Excel (XLSX)',
      description: 'Tableur pour analyse et manipulation des données',
      icon: 'Table',
      size: 'Petit'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Format texte compatible avec tous les logiciels',
      icon: 'FileSpreadsheet',
      size: 'Très petit'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Format structuré pour intégrations techniques',
      icon: 'Code',
      size: 'Petit'
    }
  ];

  const handleExport = (format) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      console.log(`Exporting data in ${format} format`);
    }, 2000);
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
    }, 2000);
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? (
      <Icon name="CheckCircle" size={16} color="var(--color-success)" />
    ) : (
      <Icon name="XCircle" size={16} color="var(--color-error)" />
    );
  };

  const getTypeLabel = (type) => {
    return type === 'automatic' ? 'Automatique' : 'Manuel';
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Sauvegarde Automatique
        </h3>
        <div className="space-y-4">
          <Checkbox
            label="Activer les sauvegardes automatiques"
            description="Vos données seront sauvegardées automatiquement selon la fréquence choisie"
            checked={autoBackup}
            onChange={(e) => setAutoBackup(e?.target?.checked)}
          />

          {autoBackup && (
            <div className="ml-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fréquence de Sauvegarde
                </label>
                <select
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e?.target?.value)}
                  className="w-full md:w-64 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="daily">Quotidienne (2h00)</option>
                  <option value="weekly">Hebdomadaire (Dimanche 2h00)</option>
                  <option value="monthly">Mensuelle (1er du mois 2h00)</option>
                </select>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                <Icon name="Info" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  Les sauvegardes sont conservées pendant 30 jours. Vous pouvez restaurer vos données à tout moment depuis l'historique des sauvegardes.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              variant="default"
              iconName="Database"
              iconPosition="left"
              loading={isBackingUp}
              onClick={handleBackup}
            >
              {isBackingUp ? 'Sauvegarde en cours...' : 'Créer une Sauvegarde Maintenant'}
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Historique des Sauvegardes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Date & Heure
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Taille
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                  Statut
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {backupHistory?.map((backup) => (
                <tr key={backup?.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 text-sm text-foreground">
                    {backup?.date}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {getTypeLabel(backup?.type)}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {backup?.size}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusIcon(backup?.status)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" iconName="Download">
                        Télécharger
                      </Button>
                      <Button variant="ghost" size="sm" iconName="RotateCcw">
                        Restaurer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Export des Données
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Exportez vos données dans différents formats pour analyse, archivage ou migration vers d'autres systèmes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {exportFormats?.map((format) => (
            <div
              key={format?.id}
              className="p-4 border border-border rounded-lg hover:border-primary transition-smooth"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={format?.icon} size={20} color="var(--color-primary)" />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-semibold text-foreground mb-1">
                    {format?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {format?.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Taille: {format?.size}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
                fullWidth
                loading={isExporting}
                onClick={() => handleExport(format?.id)}
              >
                Exporter
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Conformité RGPD
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 border border-border rounded-lg">
            <Icon name="Shield" size={24} color="var(--color-success)" className="flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">
                Droit à la Portabilité
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Conformément au RGPD, vous pouvez télécharger toutes vos données personnelles dans un format structuré et couramment utilisé.
              </p>
              <Button variant="outline" iconName="Download" iconPosition="left">
                Télécharger Mes Données
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 border border-border rounded-lg">
            <Icon name="Trash2" size={24} color="var(--color-error)" className="flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">
                Droit à l'Effacement
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Vous pouvez demander la suppression définitive de toutes vos données. Cette action est irréversible et entraînera la fermeture de votre compte.
              </p>
              <Button variant="destructive" iconName="AlertTriangle" iconPosition="left">
                Supprimer Mon Compte
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Icon name="Lock" size={24} color="var(--color-primary)" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-heading font-semibold text-foreground mb-2">
              Sécurité des Données
            </h4>
            <p className="text-sm text-muted-foreground">
              Toutes vos données sont chiffrées au repos et en transit. Les sauvegardes sont stockées dans des centres de données sécurisés en France, conformes aux normes ISO 27001 et hébergés chez des prestataires certifiés HDS (Hébergeur de Données de Santé).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSettings;