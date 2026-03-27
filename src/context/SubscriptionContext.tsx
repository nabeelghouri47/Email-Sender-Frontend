import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { subscriptionApi } from '../api/endpoints';

interface SubscriptionContextType {
  subscription: any;
  loading: boolean;
  hasFeature: (featureCode: string) => boolean;
  canCreateCampaign: (campaignType: string) => boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  const getUserFromLocalStorage = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  const fetchSubscription = async () => {
    if (fetchAttempted) return; // Prevent multiple fetches
    
    try {
      const user = getUserFromLocalStorage();
      const isAdmin = user?.roles?.includes('ROLE_ADMIN');
      const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');
      
      // Skip subscription fetch for admin and super admin
      if (isAdmin || isSuperAdmin) {
        setSubscription(null);
        setLoading(false);
        setFetchAttempted(true);
        return;
      }

      const res = await subscriptionApi.getMySubscription();
      setSubscription(res.data);
      setFetchAttempted(true);
    } catch (error: any) {
      if (error.response?.status === 204) {
        setSubscription(null); // No subscription
      }
      console.error('Subscription fetch error:', error);
      setFetchAttempted(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchSubscription();
    } else {
      setLoading(false);
      setFetchAttempted(true);
    }

    // Fallback: Force stop loading after 5 seconds
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Subscription loading timeout - forcing completion');
        setLoading(false);
        setFetchAttempted(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const hasFeature = (featureCode: string): boolean => {
    const user = getUserFromLocalStorage();
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');
    
    // Admins and Super Admins have access to all features
    if (isAdmin || isSuperAdmin) return true;
    
    // Regular users need valid subscription
    if (!subscription || !subscription.isValid) return false;
    return subscription.availableFeatures?.includes(featureCode) || false;
  };

  const canCreateCampaign = (campaignType: string): boolean => {
    const user = getUserFromLocalStorage();
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');
    
    // Admins and Super Admins have unlimited campaign creation
    if (isAdmin || isSuperAdmin) return true;
    
    // Regular users need valid subscription and check limits
    if (!subscription || !subscription.isValid) return false;
    
    const plan = subscription.plan;
    const used = subscription[`${campaignType.toLowerCase()}CampaignsUsed`] || 0;
    const limit = plan[`${campaignType.toLowerCase()}CampaignLimit`];
    
    return limit === null || used < limit;
  };

  const refreshSubscription = async () => {
    setLoading(true);
    setFetchAttempted(false);
    await fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider
      value={{ subscription, loading, hasFeature, canCreateCampaign, refreshSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
