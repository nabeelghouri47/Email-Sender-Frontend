import { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { toast } from 'react-toastify';

export const useCampaignLimit = () => {
  const { subscription, canCreateCampaign } = useSubscription();
  const [checking, setChecking] = useState(false);

  const checkLimit = (campaignType: string): boolean => {
    setChecking(true);

    if (!subscription || !subscription.isValid) {
      toast.error('No active subscription. Please subscribe to a plan.');
      setChecking(false);
      return false;
    }

    const canCreate = canCreateCampaign(campaignType);
    
    if (!canCreate) {
      const plan = subscription.plan;
      const used = subscription[`${campaignType.toLowerCase()}CampaignsUsed`] || 0;
      const limit = plan[`${campaignType.toLowerCase()}CampaignLimit`];
      
      toast.error(
        `Campaign limit reached! You've used ${used}/${limit} ${campaignType} campaigns. Upgrade your plan for more.`,
        { autoClose: 5000 }
      );
      setChecking(false);
      return false;
    }

    setChecking(false);
    return true;
  };

  const getLimitInfo = (campaignType: string) => {
    if (!subscription || !subscription.isValid) {
      return { used: 0, limit: 0, remaining: 0, unlimited: false };
    }

    const plan = subscription.plan;
    const used = subscription[`${campaignType.toLowerCase()}CampaignsUsed`] || 0;
    const limit = plan[`${campaignType.toLowerCase()}CampaignLimit`];
    
    return {
      used,
      limit: limit || 0,
      remaining: limit ? limit - used : Infinity,
      unlimited: limit === null,
    };
  };

  return { checkLimit, getLimitInfo, checking };
};
