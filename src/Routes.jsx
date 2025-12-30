import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import Login from './pages/login';
import TaxDeclarations from './pages/tax-declarations';
import AccountSettings from './pages/account-settings';
import FinancialReports from './pages/financial-reports';
import Dashboard from './pages/dashboard';
import InvoiceManagement from './pages/invoice-management';
import ClientManagement from './pages/client-management';
import ExpenseTracking from './pages/expense-tracking';
import SubscriptionPlans from "./pages/subscription-plans";
import RealTimeActivityMonitor from "./pages/real-time-activity-monitor";
import DataImport from "./pages/data-import";
import PaymentProcessing from "./pages/payment-processing";
import AIFinancialInsights from './pages/ai-financial-insights';
import MarketplaceHub from './pages/marketplace-hub';
import DeveloperAPIDocumentation from './pages/developer-api-documentation';
import WebhookManagement from 'pages/webhook-management';
import { useGoogleAnalytics } from "./hooks/useGoogleAnalytics";
import AuditTrailDashboard from './pages/audit-trail-dashboard';

// Analytics wrapper component to use the hook inside Router context
const AnalyticsWrapper = ({ children }) => {
  useGoogleAnalytics();
  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter basename="/comptaflow">
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tax-declarations" element={<TaxDeclarations />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/financial-reports" element={<FinancialReports />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoice-management" element={<InvoiceManagement />} />
          <Route path="/client-management" element={<ClientManagement />} />
          <Route path="/expense-tracking" element={<ExpenseTracking />} />
          <Route path="/subscription-plans" element={<SubscriptionPlans />} />
          <Route path="/real-time-activity-monitor" element={<RealTimeActivityMonitor />} />
          <Route path="/data-import" element={<DataImport />} />
          <Route path="/payment-processing" element={<PaymentProcessing />} />
          <Route path="/ai-insights" element={<AIFinancialInsights />} />
          <Route path="/marketplace-hub" element={<MarketplaceHub />} />
          <Route path="/developer-api-documentation" element={<DeveloperAPIDocumentation />} />
          <Route path="/webhook-management" element={<WebhookManagement />} />
          <Route path="/audit-trail-dashboard" element={<AuditTrailDashboard />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default AppRoutes;