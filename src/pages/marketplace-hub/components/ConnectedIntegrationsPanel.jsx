import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Settings,
  BarChart3,
  ExternalLink
} from 'lucide-react';

const ConnectedIntegrationsPanel = ({ 
  userIntegrations = [], 
  onDisconnect, 
  onConfigure,
  onViewLogs 
}) => {
  const getStatusIcon = (status) => {
    const icons = {
      connected: <CheckCircle className="w-5 h-5 text-success" />,
      disconnected: <XCircle className="w-5 h-5 text-error" />,
      pending: <Clock className="w-5 h-5 text-warning" />,
      error: <AlertTriangle className="w-5 h-5 text-error" />
    };
    return icons?.[status] || <Clock className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      connected: 'Connecté',
      disconnected: 'Déconnecté',
      pending: 'En attente',
      error: 'Erreur'
    };
    return labels?.[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      connected: 'text-success',
      disconnected: 'text-muted-foreground',
      pending: 'text-warning',
      error: 'text-error'
    };
    return colors?.[status] || 'text-muted-foreground';
  };

  const formatLastSync = (lastSyncAt) => {
    if (!lastSyncAt) return 'Jamais synchronisé';
    
    const date = new Date(lastSyncAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)} h`;
    return `Il y a ${Math.floor(diffMins / 1440)} j`;
  };

  if (!userIntegrations || userIntegrations?.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 text-center">
        <div className="text-muted-foreground mb-4">
          <ExternalLink className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Aucune intégration connectée</p>
          <p className="text-sm mt-1">
            Connectez vos premiers outils pour étendre les fonctionnalités de ComptaFlow
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Mes Intégrations
        </h3>
        <span className="text-sm text-muted-foreground">
          {userIntegrations?.length} intégration{userIntegrations?.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-3">
        {userIntegrations?.map((userInt) => (
          <div 
            key={userInt?.id}
            className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {userInt?.integration?.logoUrl ? (
                  <img 
                    src={userInt?.integration?.logoUrl} 
                    alt={`${userInt?.integration?.name} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                    🔌
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground truncate">
                      {userInt?.integration?.name || 'Intégration inconnue'}
                    </h4>
                    {userInt?.connectionName && (
                      <p className="text-sm text-muted-foreground truncate">
                        {userInt?.connectionName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(userInt?.status)}
                    <span className={`text-sm font-medium ${getStatusColor(userInt?.status)}`}>
                      {getStatusLabel(userInt?.status)}
                    </span>
                  </div>
                </div>

                {userInt?.status === 'connected' && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span>
                      Dernière synchro: {formatLastSync(userInt?.lastSyncAt)}
                    </span>
                    {userInt?.autoSync && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        Auto-sync actif
                      </span>
                    )}
                  </div>
                )}

                {userInt?.errorMessage && (
                  <div className="mb-3 p-2 bg-error/10 border border-error/20 rounded text-sm text-error">
                    {userInt?.errorMessage}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onConfigure?.(userInt)}
                    className="
                      flex items-center gap-1 px-3 py-1.5 text-sm
                      text-muted-foreground hover:text-foreground
                      border border-border hover:border-border-hover rounded-md
                      transition-colors
                    "
                  >
                    <Settings className="w-4 h-4" />
                    Configurer
                  </button>
                  <button
                    onClick={() => onViewLogs?.(userInt)}
                    className="
                      flex items-center gap-1 px-3 py-1.5 text-sm
                      text-muted-foreground hover:text-foreground
                      border border-border hover:border-border-hover rounded-md
                      transition-colors
                    "
                  >
                    <BarChart3 className="w-4 h-4" />
                    Logs
                  </button>
                  <button
                    onClick={() => onDisconnect?.(userInt)}
                    disabled={userInt?.status === 'disconnected'}
                    className="
                      px-3 py-1.5 text-sm
                      text-error hover:bg-error/10
                      border border-error/20 hover:border-error rounded-md
                      transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    Déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectedIntegrationsPanel;