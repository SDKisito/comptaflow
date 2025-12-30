import React from 'react';
import { Users, Circle } from 'lucide-react';

export function ActiveUsersPanel({ sessions, loading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'idle':
        return 'text-yellow-500';
      case 'away':
        return 'text-orange-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Actif',
      idle: 'Inactif',
      away: 'Absent',
      offline: 'Hors ligne'
    };
    return labels?.[status] || status;
  };

  const getScreenLabel = (screen) => {
    const screenLabels = {
      '/dashboard': 'Tableau de bord',
      '/invoice-management': 'Gestion des factures',
      '/expense-tracking': 'Suivi des dépenses',
      '/client-management': 'Gestion clients',
      '/financial-reports': 'Rapports financiers',
      '/tax-declarations': 'Déclarations fiscales'
    };
    return screenLabels?.[screen] || screen;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Users className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Utilisateurs actifs</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3]?.map((i) => (
            <div key={i} className="animate-pulse flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Utilisateurs actifs</h2>
        </div>
        <span className="text-sm text-gray-500">{sessions?.length || 0} en ligne</span>
      </div>
      <div className="space-y-3">
        {sessions?.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun utilisateur actif</p>
          </div>
        ) : (
          sessions?.map((session) => (
            <div
              key={session?.id}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="relative mr-3">
                {session?.userProfile?.avatarUrl ? (
                  <img
                    src={session?.userProfile?.avatarUrl}
                    alt={session?.userProfile?.fullName || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-sm">
                      {session?.userProfile?.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <Circle
                  className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(session?.status)} fill-current`}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.userProfile?.fullName || 'Utilisateur inconnu'}
                  </p>
                  <span className={`text-xs ${getStatusColor(session?.status)}`}>
                    {getStatusLabel(session?.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {getScreenLabel(session?.currentScreen)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Dernière activité: {new Date(session.lastActivity)?.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}