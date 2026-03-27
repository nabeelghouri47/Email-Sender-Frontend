import axiosInstance from './axiosInstance';

export const authApi = {
  login: (username: string, password: string) =>
    axiosInstance.post('/auth/login', { username, password }),
  
  refreshToken: (refreshToken: string) =>
    axiosInstance.post('/auth/refresh', { refreshToken }),
};

export const userApi = {
  getAllUsers: () => axiosInstance.get('/users'),
  
  createUser: (data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => axiosInstance.post('/users', data),
  
  updateUser: (id: number, data: any) => axiosInstance.put(`/users/${id}`, data),
  
  toggleStatus: (id: number, enabled: boolean) =>
    axiosInstance.patch(`/users/${id}/status`, { enabled }),
  
  toggleProfileEdit: (id: number, canEdit: boolean) =>
    axiosInstance.patch(`/users/${id}/profile-edit`, { canEdit }),
};

export const campaignApi = {
  getAllCampaigns: () => axiosInstance.get('/campaigns'),
  
  createCampaign: (data: {
    name: string;
    templateId: number;
    configId: number;
    dailyLimit: number;
    autoRestart: boolean;
  }) => axiosInstance.post('/campaigns', data),
  
  updateCampaign: (id: number, data: any) =>
    axiosInstance.put(`/campaigns/${id}`, data),
  
  deleteCampaign: (id: number) => axiosInstance.delete(`/campaigns/${id}`),
  
  uploadClients: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`/campaigns/${id}/upload-clients`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  toggleStatus: (id: number, isActive: boolean) =>
    axiosInstance.patch(`/campaigns/${id}/status`, { isActive }),
  
  // New Campaign Management APIs
  scheduleCampaign: (id: number, data: {
    scheduledStartDate: string;
    timezone: string;
  }) => axiosInstance.post(`/campaigns/${id}/schedule`, data),
  
  pauseCampaign: (id: number) => axiosInstance.post(`/campaigns/${id}/pause`),
  
  resumeCampaign: (id: number) => axiosInstance.post(`/campaigns/${id}/resume`),
  
  cancelCampaign: (id: number) => axiosInstance.post(`/campaigns/${id}/cancel`),
  
  getCampaignStatus: (id: number) => axiosInstance.get(`/campaigns/${id}/status`),
  
  sendNow: (id: number) => axiosInstance.post(`/campaigns/${id}/send-now`),
};

export const templateApi = {
  getAllTemplates: () => axiosInstance.get('/templates'),
  
  createTemplate: (data: { name: string; subject: string; body: string }) =>
    axiosInstance.post('/templates', data),
  
  updateTemplate: (id: number, data: { name: string; subject: string; body: string }) =>
    axiosInstance.put(`/templates/${id}`, data),
  
  deleteTemplate: (id: number) => axiosInstance.delete(`/templates/${id}`),
  
  // Template versioning
  getVersions: (id: number) => axiosInstance.get(`/templates/${id}/versions`),
  
  revertToVersion: (id: number, versionNumber: number) =>
    axiosInstance.post(`/templates/${id}/revert/${versionNumber}`),
  
  // Template preview & validation
  previewTemplate: (id: number, sampleData?: any) =>
    axiosInstance.post(`/templates/${id}/preview`, sampleData),
  
  validateTemplate: (id: number) => axiosInstance.get(`/templates/${id}/validate`),
  
  // Test email
  sendTestEmail: (data: {
    templateId: number;
    recipientEmail: string;
    variables?: any;
  }) => axiosInstance.post('/templates/send-test', data),
};

export const emailConfigApi = {
  getAllConfigs: () => axiosInstance.get('/email-configs'),
  
  createConfig: (data: {
    smtpHost: string;
    smtpPort: number;
    senderEmail: string;
    senderPassword: string;
    senderName?: string;
    useTls: boolean;
  }) => axiosInstance.post('/email-configs', data),
  
  updateConfig: (id: number, data: any) =>
    axiosInstance.put(`/email-configs/${id}`, data),
  
  deleteConfig: (id: number) => axiosInstance.delete(`/email-configs/${id}`),
  
  // Domain Health & Reputation
  getDomainHealth: (id: number) => axiosInstance.get(`/email-configs/${id}/domain-health`),
  
  getDnsSetupGuide: (id: number) => axiosInstance.get(`/email-configs/${id}/dns-setup-guide`),
  
  updateDnsConfiguration: (id: number, data: {
    spfConfigured?: boolean;
    dkimConfigured?: boolean;
    dmarcConfigured?: boolean;
  }) => axiosInstance.patch(`/email-configs/${id}/dns-configuration`, data),
};

// Deliverability APIs
export const deliverabilityApi = {
  getSuppressionList: () => axiosInstance.get('/deliverability/suppression-list'),
  
  suppressEmail: (data: {
    email: string;
    reason: string;
    notes?: string;
    isGlobal?: boolean;
  }) => axiosInstance.post('/deliverability/suppress', data),
  
  removeFromSuppression: (id: number) => axiosInstance.delete(`/deliverability/suppress/${id}`),
  
  checkSuppressed: (email: string) => axiosInstance.get(`/deliverability/check-suppressed/${email}`),
  
  getAllBounces: () => axiosInstance.get('/deliverability/bounces'),
  
  checkSpam: (data: {
    subject: string;
    body: string;
  }) => axiosInstance.post('/deliverability/spam-check', data),
  
  initializeKeywords: () => axiosInstance.post('/deliverability/initialize-keywords'),
};

// Email Warmup APIs
export const warmupApi = {
  startWarmup: (data: {
    configId: number;
    targetDailyLimit: number;
    incrementPerDay: number;
  }) => axiosInstance.post('/warmup/start', data),
  
  getWarmupStatus: (configId: number) => axiosInstance.get(`/warmup/status/${configId}`),
  
  pauseWarmup: (id: number) => axiosInstance.post(`/warmup/${id}/pause`),
  
  resumeWarmup: (id: number) => axiosInstance.post(`/warmup/${id}/resume`),
  
  stopWarmup: (id: number) => axiosInstance.post(`/warmup/${id}/stop`),
  
  getActiveWarmups: () => axiosInstance.get('/warmup/active'),
};

// AI Content APIs
export const aiApi = {
  generateSubjectLines: (data: {
    contentType: string;
    tone: string;
    industry: string;
    targetAudience: string;
    productService: string;
    keyPoints: string;
    variantsCount?: number;
  }) => axiosInstance.post('/ai/generate/subject', data),
  
  generateEmailBody: (data: {
    contentType: string;
    tone: string;
    industry: string;
    targetAudience: string;
    productService: string;
    keyPoints: string;
    context?: string;
  }) => axiosInstance.post('/ai/generate/body', data),
  
  generateCTA: (data: {
    contentType: string;
    tone: string;
    productService: string;
  }) => axiosInstance.post('/ai/generate/cta', data),
  
  analyzePersonalization: (data: {
    subject: string;
    body: string;
  }) => axiosInstance.post('/ai/analyze/personalization', data),
  
  getHistory: () => axiosInstance.get('/ai/history'),
  
  getSavedContent: () => axiosInstance.get('/ai/saved'),
  
  getSavedByType: (contentType: string) => axiosInstance.get(`/ai/saved/${contentType}`),
  
  markAsUsed: (id: number) => axiosInstance.patch(`/ai/saved/${id}/use`),
  
  deleteSaved: (id: number) => axiosInstance.delete(`/ai/saved/${id}`),
};

// ENHANCEMENT: Email Performance Prediction API
export const performanceApi = {
  predictPerformance: (data: {
    subject: string;
    body: string;
    industry?: string;
    targetAudience?: string;
  }) => axiosInstance.post('/performance/predict', data),
};

// ENHANCEMENT: Advanced Deliverability API
export const advancedDeliverabilityApi = {
  checkSpamAdvanced: (data: {
    subject: string;
    body: string;
  }) => axiosInstance.post('/deliverability/spam-check/advanced', data),
};

// AI Template APIs
export const aiTemplateApi = {
  generateFromImage: (formData: FormData) => 
    axiosInstance.post('/ai/template/generate-from-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  validateTemplate: (data: {
    subject: string;
    body: string;
  }) => axiosInstance.post('/ai/template/validate', data),
  
  addVariable: (templateId: number, data: {
    variableName: string;
    displayName: string;
    defaultValue?: string;
    dataType: string;
    isRequired: boolean;
    description?: string;
  }) => axiosInstance.post(`/ai/template/${templateId}/variables`, data),
  
  getVariables: (templateId: number) => 
    axiosInstance.get(`/ai/template/${templateId}/variables`),
  
  updateVariable: (variableId: number, data: any) => 
    axiosInstance.put(`/ai/template/variables/${variableId}`, data),
  
  deleteVariable: (variableId: number) => 
    axiosInstance.delete(`/ai/template/variables/${variableId}`),
};



// Multi-Channel Marketing APIs
export const multiChannelApi = {
  getAllCampaigns: () => axiosInstance.get('/multi-channel/campaigns'),
  
  getCampaignById: (id: number) => axiosInstance.get(`/multi-channel/campaigns/${id}`),
  
  createCampaign: (data: {
    name: string;
    description?: string;
    scheduledTime?: string;
    targetAudience?: string;
    messages: Array<{
      channelType: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PUSH_NOTIFICATION';
      recipients: string[];
      subject?: string;
      content: string;
      templateId?: number;
    }>;
  }) => axiosInstance.post('/multi-channel/campaigns', data),
  
  launchCampaign: (id: number) => 
    axiosInstance.post(`/multi-channel/campaigns/${id}/launch`),
  
  pauseCampaign: (id: number) => 
    axiosInstance.post(`/multi-channel/campaigns/${id}/pause`),
  
  cancelCampaign: (id: number) => 
    axiosInstance.post(`/multi-channel/campaigns/${id}/cancel`),
  
  getCampaignStats: (id: number) => 
    axiosInstance.get(`/multi-channel/campaigns/${id}/stats`),
};

// AI Provider Config APIs
export const aiProviderConfigApi = {
  getMyConfig: () => axiosInstance.get('/ai-provider-config/me'),
  saveMyConfig: (data: {
    openaiApiKey?: string;
    openaiModel?: string;
    geminiApiKey?: string;
    geminiModel?: string;
    claudeApiKey?: string;
    claudeModel?: string;
    textProvider?: 'OPENAI' | 'GEMINI';
    imageProvider?: 'GEMINI_NANO' | 'OPENAI_DALLE';
    templateProvider?: 'CLAUDE' | 'OPENAI' | 'GEMINI';
  }) => axiosInstance.post('/ai-provider-config/me', data),
  deleteMyConfig: () => axiosInstance.delete('/ai-provider-config/me'),
  getGlobalConfig: () => axiosInstance.get('/ai-provider-config/global'),
  saveGlobalConfig: (data: any) => axiosInstance.post('/ai-provider-config/global', data),
};

// Subscription APIs
export const subscriptionApi = {
  getPlans: () => axiosInstance.get('/subscriptions/plans'),
  getAllPlans: () => axiosInstance.get('/subscriptions/plans/all'),
  createPlan: (data: any) => axiosInstance.post('/subscriptions/plans', data),
  updatePlan: (id: number, data: any) => axiosInstance.put(`/subscriptions/plans/${id}`, data),
  deletePlan: (id: number) => axiosInstance.delete(`/subscriptions/plans/${id}`),
  
  getMySubscription: () => axiosInstance.get('/subscriptions/my-subscription'),
  subscribe: (planId: number, billingCycle: 'MONTHLY' | 'YEARLY') =>
    axiosInstance.post('/subscriptions/subscribe', { planId, billingCycle }),
  cancelSubscription: () => axiosInstance.post('/subscriptions/cancel'),
  
  hasFeature: (featureCode: string) => axiosInstance.get(`/subscriptions/has-feature/${featureCode}`),
  canCreateCampaign: (campaignType: string) => axiosInstance.get(`/subscriptions/can-create-campaign/${campaignType}`),
};

// Meta Config APIs
export const metaConfigApi = {
  getAll: () => axiosInstance.get('/meta-configs'),
  getActive: () => axiosInstance.get('/meta-configs/active'),
  create: (data: {
    name: string;
    facebookPageId: string;
    facebookAccessToken: string;
    instagramAccountId?: string;
    instagramEnabled?: boolean;
    isActive?: boolean;
  }) => axiosInstance.post('/meta-configs', data),
  update: (id: number, data: any) => axiosInstance.put(`/meta-configs/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/meta-configs/${id}`),
};

// AI Social Campaign APIs
export const aiSocialApi = {
  getAllCampaigns: () => axiosInstance.get('/ai-social/campaigns'),

  createCampaign: (data: {
    name: string;
    description?: string;
    aiPrompt: string;
    platform: 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN';
    metaConfigId: number;
    durationDays: number;
    postsPerDay: number;
    postingTime: string;
    requiresApproval: boolean;
  }) => axiosInstance.post('/ai-social/campaigns', data),

  startCampaign: (id: number) =>
    axiosInstance.post(`/ai-social/campaigns/${id}/start`),

  pauseCampaign: (id: number) =>
    axiosInstance.post(`/ai-social/campaigns/${id}/pause`),

  getCampaignPosts: (id: number) =>
    axiosInstance.get(`/ai-social/campaigns/${id}/posts`),

  approvePost: (id: number, token: string) =>
    axiosInstance.get(`/ai-social/posts/${id}/approve?token=${token}`),

  requestRevision: (id: number, token: string, instructions: string) =>
    axiosInstance.post(`/ai-social/posts/${id}/request-revision`, { token, instructions }),
};
