import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Chip,
  Alert,
  Avatar,
} from '@mui/material';
import axios from '../api/axiosInstance';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: Array<{ name: string }>;
  createdAt: string;
}

export const SystemUserControl = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/system-control/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId: number, currentStatus: boolean) => {
    try {
      await axios.put(`/api/system-control/users/${userId}/toggle`, {
        enabled: !currentStatus,
      });
      setMessage(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user:', error);
      setMessage('Failed to toggle user status');
    }
  };

  const getRoleColor = (roleName: string) => {
    if (roleName === 'ROLE_SUPER_ADMIN') return 'error';
    if (roleName === 'ROLE_ADMIN') return 'warning';
    return 'default';
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System User Control
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enable or disable user accounts. Disabled users cannot log in to the system.
      </Typography>

      {message && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {user.firstName?.[0] || user.username[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {user.roles.map((role) => (
                      <Chip
                        key={role.name}
                        label={role.name.replace('ROLE_', '')}
                        color={getRoleColor(role.name) as any}
                        size="small"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={user.enabled ? 'Active' : 'Disabled'}
                    color={user.enabled ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={user.enabled}
                    onChange={() => handleToggle(user.id, user.enabled)}
                    color="primary"
                    disabled={user.roles.some(r => r.name === 'ROLE_SUPER_ADMIN')}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
