/**
 * Google Analytics tracking utility for ComptaFlow
 * Provides methods for tracking user interactions and conversions
 */

/**
 * Track custom events with GA4
 * @param {string} eventName - Name of the event
 * @param {Object} eventParams - Event parameters
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (import.meta.env?.MODE !== 'production' || typeof window.gtag === 'undefined') {
    console.log(`[GA4] Event: ${eventName}`, eventParams);
    return;
  }

  window.gtag('event', eventName, {
    ...eventParams,
    page: window.location?.pathname
  });
};

/**
 * Track subscription-related events
 */
export const trackSubscription = {
  // Track when user views subscription plans
  viewPlans: () => {
    trackEvent('view_subscription_plans', {
      event_category: 'Subscription',
      event_label: 'Plans Page View'
    });
  },

  // Track when user selects a plan
  selectPlan: (planName, billingCycle, price) => {
    trackEvent('select_subscription_plan', {
      event_category: 'Subscription',
      plan_name: planName,
      billing_cycle: billingCycle,
      plan_price: price
    });
  },

  // Track subscription conversion
  subscribe: (planName, billingCycle, price) => {
    trackEvent('subscription_conversion', {
      event_category: 'Subscription',
      plan_name: planName,
      billing_cycle: billingCycle,
      value: price,
      currency: 'EUR'
    });
  },

  // Track billing cycle toggle
  toggleBilling: (billingCycle) => {
    trackEvent('toggle_billing_cycle', {
      event_category: 'Subscription',
      billing_cycle: billingCycle
    });
  }
};

/**
 * Track feature adoption and usage
 */
export const trackFeature = {
  // Track invoice actions
  invoice: {
    create: () => trackEvent('create_invoice', { event_category: 'Feature', feature_name: 'Invoice Management' }),
    download: (format) => trackEvent('download_invoice', { event_category: 'Feature', feature_name: 'Invoice Management', format }),
    send: () => trackEvent('send_invoice', { event_category: 'Feature', feature_name: 'Invoice Management' }),
    preview: () => trackEvent('preview_invoice', { event_category: 'Feature', feature_name: 'Invoice Management' })
  },

  // Track expense tracking
  expense: {
    add: () => trackEvent('add_expense', { event_category: 'Feature', feature_name: 'Expense Tracking' }),
    filter: (filterType) => trackEvent('filter_expenses', { event_category: 'Feature', feature_name: 'Expense Tracking', filter_type: filterType }),
    export: () => trackEvent('export_expenses', { event_category: 'Feature', feature_name: 'Expense Tracking' })
  },

  // Track financial reports
  report: {
    view: (reportType) => trackEvent('view_report', { event_category: 'Feature', feature_name: 'Financial Reports', report_type: reportType }),
    export: (reportType, format) => trackEvent('export_report', { event_category: 'Feature', feature_name: 'Financial Reports', report_type: reportType, format }),
    dateRange: (startDate, endDate) => trackEvent('change_report_date_range', { event_category: 'Feature', feature_name: 'Financial Reports', start_date: startDate, end_date: endDate })
  },

  // Track client management
  client: {
    add: () => trackEvent('add_client', { event_category: 'Feature', feature_name: 'Client Management' }),
    view: () => trackEvent('view_client_details', { event_category: 'Feature', feature_name: 'Client Management' }),
    edit: () => trackEvent('edit_client', { event_category: 'Feature', feature_name: 'Client Management' })
  },

  // Track tax declarations
  tax: {
    prepare: (declarationType) => trackEvent('prepare_tax_declaration', { event_category: 'Feature', feature_name: 'Tax Declarations', declaration_type: declarationType }),
    submit: (declarationType) => trackEvent('submit_tax_declaration', { event_category: 'Feature', feature_name: 'Tax Declarations', declaration_type: declarationType }),
    view: (declarationType) => trackEvent('view_tax_declaration', { event_category: 'Feature', feature_name: 'Tax Declarations', declaration_type: declarationType })
  }
};

/**
 * Track user authentication events
 */
export const trackAuth = {
  login: (method = 'email') => {
    trackEvent('login', {
      event_category: 'Authentication',
      method
    });
  },

  logout: () => {
    trackEvent('logout', {
      event_category: 'Authentication'
    });
  },

  register: (method = 'email') => {
    trackEvent('sign_up', {
      event_category: 'Authentication',
      method
    });
  }
};

/**
 * Track user engagement
 */
export const trackEngagement = {
  // Track dashboard interactions
  dashboardAction: (actionType) => {
    trackEvent('dashboard_interaction', {
      event_category: 'Engagement',
      action_type: actionType
    });
  },

  // Track search usage
  search: (searchTerm) => {
    trackEvent('search', {
      event_category: 'Engagement',
      search_term: searchTerm
    });
  },

  // Track filter usage
  filter: (filterCategory, filterValue) => {
    trackEvent('filter_usage', {
      event_category: 'Engagement',
      filter_category: filterCategory,
      filter_value: filterValue
    });
  },

  // Track export actions
  export: (contentType, format) => {
    trackEvent('export_data', {
      event_category: 'Engagement',
      content_type: contentType,
      format
    });
  }
};

/**
 * Track errors and issues
 */
export const trackError = (errorType, errorMessage, errorLocation) => {
  trackEvent('error', {
    event_category: 'Error',
    error_type: errorType,
    error_message: errorMessage,
    error_location: errorLocation
  });
};