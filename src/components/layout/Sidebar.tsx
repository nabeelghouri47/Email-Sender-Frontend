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
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Hub as HubIcon,
  Settings as SettingsIcon,
  SmartToy as SmartToyIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import styled from 'styled-components';
import { SidebarContext } from './Layout';

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
          <MenuItem
            icon={<DashboardIcon />}
            active={location.pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </MenuItem>

          <SubMenu label="Campaigns" icon={<CampaignIcon />}>
            <MenuItem
              icon={<CampaignIcon />}
              active={location.pathname === '/campaigns'}
              onClick={() => navigate('/campaigns')}
            >
              Email Campaigns
            </MenuItem>
            <MenuItem
              icon={<HubIcon />}
              active={location.pathname === '/multi-channel'}
              onClick={() => navigate('/multi-channel')}
            >
              Multi-Channel
            </MenuItem>
          </SubMenu>

          <MenuItem
            icon={<DescriptionIcon />}
            active={location.pathname === '/templates'}
            onClick={() => navigate('/templates')}
          >
            Templates
          </MenuItem>

          <SubMenu label="Configuration" icon={<SettingsIcon />}>
            <MenuItem
              icon={<EmailIcon />}
              active={location.pathname === '/email-configs'}
              onClick={() => navigate('/email-configs')}
            >
              Email Configs
            </MenuItem>
            <MenuItem
              icon={<TrendingUpIcon />}
              active={location.pathname === '/email-warmup'}
              onClick={() => navigate('/email-warmup')}
            >
              Email Warmup
            </MenuItem>
          </SubMenu>

          <SubMenu label="Deliverability" icon={<VerifiedUserIcon />}>
            <MenuItem
              icon={<BlockIcon />}
              active={location.pathname === '/suppression-list'}
              onClick={() => navigate('/suppression-list')}
            >
              Suppression List
            </MenuItem>
            <MenuItem
              icon={<SecurityIcon />}
              active={location.pathname === '/spam-checker'}
              onClick={() => navigate('/spam-checker')}
            >
              Spam Checker
            </MenuItem>
          </SubMenu>

          <SubMenu label="AI Tools" icon={<SmartToyIcon />}>
            <MenuItem
              icon={<AutoAwesomeIcon />}
              active={location.pathname === '/ai-content-generator'}
              onClick={() => navigate('/ai-content-generator')}
            >
              Content Generator
            </MenuItem>
            <MenuItem
              icon={<PsychologyIcon />}
              active={location.pathname === '/personalization-analyzer'}
              onClick={() => navigate('/personalization-analyzer')}
            >
              Personalization
            </MenuItem>
          </SubMenu>

          {user?.roles?.includes('ROLE_ADMIN') && (
            <MenuItem
              icon={<PeopleIcon />}
              active={location.pathname === '/users'}
              onClick={() => navigate('/users')}
            >
              Users
            </MenuItem>
          )}
        </Menu>
      </ProSidebar>
    </SidebarContainer>
  );
};
