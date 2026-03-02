import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Box, Badge } from '@mui/material';
import { Logout, AccountCircle, Notifications, Search } from '@mui/icons-material';
import { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../actions/authActions';
import styled from 'styled-components';
import { SidebarContext } from './Layout';

const StyledAppBar = styled(AppBar)`
  && {
    background: linear-gradient(90deg, #6366F1 0%, #A855F7 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const UserInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { collapsed } = useContext(SidebarContext);
  
  // Get user directly from localStorage
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

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <StyledAppBar 
      position="fixed" 
      sx={{ 
        left: collapsed ? 60 : 240, 
        width: collapsed ? 'calc(100% - 60px)' : 'calc(100% - 240px)', 
        zIndex: 1200,
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
          Dashboard
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton color="inherit">
            <Search />
          </IconButton>

          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <UserInfo onClick={handleMenu}>
            <Avatar
              sx={{
                bgcolor: 'white',
                color: '#A855F7',
                width: 36,
                height: 36,
              }}
            >
              {user?.firstName?.[0] || user?.username?.[0]}
            </Avatar>
          </UserInfo>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={handleClose}>
            <AccountCircle sx={{ mr: 2 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};
