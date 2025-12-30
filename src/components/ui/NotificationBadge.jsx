import React from 'react';

const NotificationBadge = ({ count = 0, type = 'default', className = '' }) => {
  if (count === 0) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-error text-error-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'success':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[20px] h-5 px-1.5
        text-xs font-medium font-caption
        rounded-full
        ${getTypeStyles()}
        ${className}
      `}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;