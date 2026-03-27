import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Box, IconButton, Typography } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Block as BlockIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon,
  Videocam as TikTokIcon,
  MonetizationOn as AdsIcon,
  AccountCircle as ProfileIcon,
  CreditCard as CardIcon,
  Subscriptions as SubscriptionIcon,
  Lock as PermissionIcon,
  AdminPanelSettings as SuperAdminIcon,
  ToggleOn as ToggleIcon,
} from '@mui/icons-material';
import styled from 'styled-components';
import { SidebarContext } from './Layout';
import { useSubscription } from '../../context/SubscriptionContext';

const SidebarContainer = styled(Box)`
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1300;
  
  .ps-sidebar-container {
    background: linear-gradient(180deg, #6366F1 0%, #A855F7 100%) !important;
    border-right: none !important;
    height: 100vh;
  }

  .ps-menu-button {
    color: rgba(255, 255, 255, 0.7) !important;
    padding: 12px 0 !important;
    margin: 4px 12px !important;
    border-radius: 8px !important;
    transition: all 0.3s ease !important;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
      color: white !important;
    }

    &.active {
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: white !important;
    }
  }

  .ps-submenu-content {
    background-color: rgba(0, 0, 0, 0.1) !important;
  }

  .ps-menu-icon {
    margin-right: 10px !important;
  }
`;

const Logo = styled(Box)`
  padding: 24px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;

  h6 {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    white-space: nowrap;
  }
`;

const ToggleButton = styled(IconButton)`
  && {
    color: white;
    padding: 8px;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  const { hasFeature } = useSubscription();

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

  const user = getUserFromLocalStorage();
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <SidebarContainer>
      <ProSidebar collapsed={collapsed} width="240px" collapsedWidth="60px">
        <Logo>
          {!collapsed && (
            <Box display="flex" alignItems="center" gap={1.5}>
              <MenuIcon />
              <Typography variant="h6">Email Sender</Typography>
            </Box>
          )}
          <ToggleButton onClick={() => setCollapsed(!collapsed)} size="small">
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </ToggleButton>
        </Logo>

        <Menu>
          {/* Dashboard */}
          <MenuItem
            icon={<DashboardIcon />}
            active={location.pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </MenuItem>

          {/* Campaigns */}
          {(isSuperAdmin || isAdmin || 
            hasFeature('EMAIL_CAMPAIGN') || 
            hasFeature('META_CAMPAIGN') || 
            hasFeature('ADS_CAMPAIGN') || 
            hasFeature('YOUTUBE_CAMPAIGN') || 
            hasFeature('TIKTOK_CAMPAIGN')) && (
            <SubMenu label="Campaigns" icon={<CampaignIcon />}>
              {(isSuperAdmin || isAdmin || hasFeature('EMAIL_CAMPAIGN')) && (
                <MenuItem
                  icon={<EmailIcon />}
                  active={location.pathname === '/campaigns'}
                  onClick={() => navigate('/campaigns')}
                >
                  Email Campaign
                </MenuItem>
              )}
              {(isSuperAdmin || isAdmin || hasFeature('META_CAMPAIGN')) && (
                <MenuItem
                  icon={<FacebookIcon />}
                  active={location.pathname === '/meta-campaigns'}
                  onClick={() => navigate('/meta-campaigns')}
                >
                  Meta Campaign
                </MenuItem>
              )}
              {(isSuperAdmin || isAdmin || hasFeature('ADS_CAMPAIGN')) && (
                <MenuItem
                  icon={<AdsIcon />}
                  active={location.pathname === '/ads-campaigns'}
                  onClick={() => navigate('/ads-campaigns')}
                >
                  Ads Campaign
                </MenuItem>
              )}
              {(isSuperAdmin || isAdmin || hasFeature('YOUTUBE_CAMPAIGN')) && (
                <MenuItem
                  icon={<YouTubeIcon />}
                  active={location.pathname === '/youtube-campaigns'}
                  onClick={() => navigate('/youtube-campaigns')}
                >
                  YouTube Campaign
                </MenuItem>
              )}
              {(isSuperAdmin || isAdmin || hasFeature('TIKTOK_CAMPAIGN')) && (
                <MenuItem
                  icon={<TikTokIcon />}
                  active={location.pathname === '/tiktok-campaigns'}
                  onClick={() => navigate('/tiktok-campaigns')}
                >
                  TikTok Campaign
                </MenuItem>
              )}
            </SubMenu>
          )}

          {/* Templates */}
          {(isSuperAdmin || isAdmin || hasFeature('TEMPLATES')) && (
            <MenuItem
              icon={<DescriptionIcon />}
              active={location.pathname === '/templates'}
              onClick={() => navigate('/templates')}
            >
              Templates
            </MenuItem>
          )}

          {/* Configuration */}
          {(isSuperAdmin || isAdmin || 
            hasFeature('EMAIL_CONFIG') || 
            hasFeature('META_CONFIG') || 
            hasFeature('ADS_CONFIG') || 
            hasFeature('YOUTUBE_CONFIG') || 
            hasFeature('TIKTOK_CONFIG')) && (
            <SubMenu label="Configuration" icon={<SettingsIcon />}>
              {(isSuperAdmin || isAdmin || hasFeature('EMAIL_CONFIG')) && (
                <MenuItem
                  icon={<EmailIcon />}
                  active={location.pathname === '/email-configs'}
                  onClick={() => navigate('/email-configs')}
                >
                  Email Config
                </MenuItem>
              )}
              {(isSuperAdmin || isAdmin || hasFeature('META_CONFIG')) && (
                <MenuItem
                  icon={<FacebookIcon />}
                  active={location.pathname === '/meta-configs'}
                  onClick={() => navigate('/meta-configs')}
                >
                  Meta Config
                </MenuItem>
              )}
              {(isSuperAdmin || isAdmin || hasFeature('ADS_CONFIG')) && (
                <MenuItem
                  icon={<AdsIcon />}
                  active={location.pathname === '/ads-configs'}
                  onClick={() => navigate('/ads-configs')}
                >
                  Ads Config
                </MenuItem>
              )}
              {(isSuperAdmin || isAdmin || hasFeature('YOUTUBE_CONFIG')) && (
                <MenuItem
                  icon={<YouTubeIcon />}
                  active={location.pathname === '/youtube-configs'}
                  onClick={() => navigate('/youtube-configs')}
                >
                  YouTube Config
                </MenuItem>
              )}
              {(isSuperAdmin || isAdmin || hasFeature('TIKTOK_CONFIG')) && (
                <MenuItem
                  icon={<TikTokIcon />}
                  active={location.pathname === '/tiktok-configs'}
                  onClick={() => navigate('/tiktok-configs')}
                >
                  TikTok Config
                </MenuItem>
              )}
            </SubMenu>
          )}

          {/* Deliverability */}
          {(isSuperAdmin || isAdmin || hasFeature('SPAM_CHECKER') || hasFeature('SUPPRESSION_LIST')) && (
            <SubMenu label="Deliverability" icon={<SecurityIcon />}>
              {(isSuperAdmin || isAdmin || hasFeature('SPAM_CHECKER')) && (
                <MenuItem
                  icon={<SecurityIcon />}
                  active={location.pathname === '/spam-checker'}
                  onClick={() => navigate('/spam-checker')}
                >
                  Spam Checker
                </MenuItem>
              )}
              {(isSuperAdmin || isAdmin || hasFeature('SUPPRESSION_LIST')) && (
                <MenuItem
                  icon={<BlockIcon />}
                  active={location.pathname === '/suppression-list'}
                  onClick={() => navigate('/suppression-list')}
                >
                  Suppression List
                </MenuItem>
              )}
            </SubMenu>
          )}

          {/* Settings */}
          <SubMenu label="Settings" icon={<SettingsIcon />}>
            <MenuItem
              icon={<ProfileIcon />}
              active={location.pathname === '/profile-settings'}
              onClick={() => navigate('/profile-settings')}
            >
              Profile Settings
            </MenuItem>
            <MenuItem
              icon={<CardIcon />}
              active={location.pathname === '/card-management'}
              onClick={() => navigate('/card-management')}
            >
              Card Management
            </MenuItem>
            {(isAdmin || isSuperAdmin) && (
              <>
                <MenuItem
                  icon={<PeopleIcon />}
                  active={location.pathname === '/users'}
                  onClick={() => navigate('/users')}
                >
                  Users
                </MenuItem>
                <MenuItem
                  icon={<SubscriptionIcon />}
                  active={location.pathname === '/subscription-management'}
                  onClick={() => navigate('/subscription-management')}
                >
                  Subscription Management
                </MenuItem>
                <MenuItem
                  icon={<SettingsIcon />}
                  active={location.pathname === '/ai-provider-settings'}
                  onClick={() => navigate('/ai-provider-settings')}
                >
                  AI Provider Keys
                </MenuItem>
                <MenuItem
                  icon={<PermissionIcon />}
                  active={location.pathname === '/permissions'}
                  onClick={() => navigate('/permissions')}
                >
                  Permissions
                </MenuItem>
              </>
            )}
          </SubMenu>

          {/* Super Admin Controls */}
          {isSuperAdmin && (
            <SubMenu label="Super Admin" icon={<SuperAdminIcon />}>
              <MenuItem
                icon={<SuperAdminIcon />}
                active={location.pathname === '/tenant-management'}
                onClick={() => navigate('/tenant-management')}
              >
                Tenant Management
              </MenuItem>
              <MenuItem
                icon={<ToggleIcon />}
                active={location.pathname === '/feature-management'}
                onClick={() => navigate('/feature-management')}
              >
                Feature Management
              </MenuItem>
              <MenuItem
                icon={<SubscriptionIcon />}
                active={location.pathname === '/plan-management'}
                onClick={() => navigate('/plan-management')}
              >
                Plan Management
              </MenuItem>
              <MenuItem
                icon={<PeopleIcon />}
                active={location.pathname === '/system-users'}
                onClick={() => navigate('/system-users')}
              >
                User Control
              </MenuItem>
            </SubMenu>
          )}
        </Menu>
      </ProSidebar>
    </SidebarContainer>
  );
};
