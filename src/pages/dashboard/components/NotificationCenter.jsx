import React from 'react';
import Icon from '../../../components/AppIcon';

const NotificationCenter = ({ notifications }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'overdue':
        return 'AlertCircle';
      case 'deadline':
        return 'Clock';
      case 'payment':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'overdue':
        return 'var(--color-error)';
      case 'deadline':
        return 'var(--color-warning)';
      case 'payment':
        return 'var(--color-success)';
      case 'warning':
        return 'var(--color-warning)';
      default:
        return 'var(--color-primary)';
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'overdue':
        return 'bg-error';
      case 'deadline':
        return 'bg-warning';
      case 'payment':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Centre de Notifications
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              {notifications?.length} nouvelles
            </span>
            <Icon name="Bell" size={20} color="var(--color-primary)" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {notifications?.map((notification) => (
          <div 
            key={notification?.id}
            className="p-4 md:p-5 hover:bg-muted transition-smooth cursor-pointer"
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div 
                className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg ${getNotificationBg(notification?.type)} bg-opacity-10 flex items-center justify-center`}
              >
                <Icon 
                  name={getNotificationIcon(notification?.type)} 
                  size={20} 
                  color={getNotificationColor(notification?.type)} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-medium text-foreground mb-1 line-clamp-1">
                  {notification?.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
                  {notification?.message}
                </p>
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={12} color="var(--color-muted-foreground)" />
                  <span className="text-xs text-muted-foreground">{notification?.time}</span>
                </div>
              </div>
              {!notification?.read && (
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;