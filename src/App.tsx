import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { theme } from './theme/theme';
import { SubscriptionProvider } from './context/SubscriptionContext';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import TemplatesEnhanced from './screens/TemplatesEnhanced';
import EmailConfigs from './screens/EmailConfigs';
import Campaigns from './screens/Campaigns';
import Users from './screens/Users';
import SuppressionList from './screens/SuppressionList';
import EmailWarmup from './screens/EmailWarmup';
import SpamChecker from './screens/SpamChecker';
import AIContentGenerator from './screens/AIContentGenerator';
import PersonalizationAnalyzer from './screens/PersonalizationAnalyzer';
import MultiChannelCampaigns from './screens/MultiChannelCampaigns';
import AISocialCampaigns from './screens/AISocialCampaigns';
import MetaConfigs from './screens/MetaConfigs';
import AIProviderSettings from './screens/AIProviderSettings';
import SubscriptionManagement from './screens/SubscriptionManagement';
import { SystemFeatureControl } from './screens/SystemFeatureControl';
import { SystemUserControl } from './screens/SystemUserControl';
import { TenantManagement } from './screens/TenantManagement';
import { FeatureManagement } from './screens/FeatureManagement';
import { DatabaseSetup } from './screens/DatabaseSetup';
import PrivateRoute from './components/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Layout } from './components/layout/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SubscriptionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/templates" element={<TemplatesEnhanced />} />
              <Route path="/email-configs" element={<EmailConfigs />} />
              <Route path="/suppression-list" element={<SuppressionList />} />
              <Route path="/email-warmup" element={<EmailWarmup />} />
              <Route path="/spam-checker" element={<SpamChecker />} />
              <Route path="/ai-content-generator" element={<AIContentGenerator />} />
              <Route path="/personalization-analyzer" element={<PersonalizationAnalyzer />} />
              <Route path="/multi-channel" element={<MultiChannelCampaigns />} />
              <Route path="/ai-social-campaigns" element={<AISocialCampaigns />} />
              <Route path="/meta-configs" element={<MetaConfigs />} />
              <Route path="/ai-provider-settings" element={<AIProviderSettings />} />
              <Route path="/subscription-management" element={<SubscriptionManagement />} />
              <Route path="/tenant-management" element={<TenantManagement />} />
              <Route path="/feature-management" element={<FeatureManagement />} />
              <Route path="/plan-management" element={<SubscriptionManagement />} />
              <Route path="/system-users" element={<SystemUserControl />} />
              <Route path="/database-setup" element={<DatabaseSetup />} />
              <Route path="/users" element={<Users />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </SubscriptionProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="dark"
      />
    </ThemeProvider>
  );
}

export default App;
