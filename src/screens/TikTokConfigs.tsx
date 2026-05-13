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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../api/axiosInstance';

interface TikTokConfig {
  id: number;
  name: string;
  accountId: string;
  isActive: boolean;
}

export const TikTokConfigs = () => {
  const [configs, setConfigs] = useState<TikTokConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TikTokConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    accountId: '',
    accessToken: '',
    appId: '',
    appSecret: '',
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await axios.get('/api/tiktok-configs');
      setConfigs(response.data);
    } catch (error) {
      console.error('Error fetching configs:', error);
      setMessage('Failed to load configs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (config?: TikTokConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        accountId: config.accountId,
        accessToken: '',
        appId: '',
        appSecret: '',
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        accountId: '',
        accessToken: '',
        appId: '',
        appSecret: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingConfig) {
        await axios.put(`/api/tiktok-configs/${editingConfig.id}`, formData);
        setMessage('Config updated successfully');
      } else {
        await axios.post('/api/tiktok-configs', formData);
        setMessage('Config created successfully');
      }
      setOpenDialog(false);
      fetchConfigs();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to save config');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this config?')) {
      try {
        await axios.delete(`/api/tiktok-configs/${id}`);
        setMessage('Config deleted successfully');
        fetchConfigs();
      } catch (error) {
        setMessage('Failed to delete config');
      }
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            TikTok Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your TikTok account credentials
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Config
        </Button>
      </Box>

      {message && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Account ID</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.name}</TableCell>
                <TableCell>{config.accountId}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={config.isActive ? 'Active' : 'Inactive'}
                    color={config.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpenDialog(config)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(config.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingConfig ? 'Edit Config' : 'Add Config'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Config Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Account ID"
              fullWidth
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            />
            <TextField
              label="Access Token"
              fullWidth
              type="password"
              value={formData.accessToken}
              onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
            />
            <TextField
              label="App ID"
              fullWidth
              value={formData.appId}
              onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
            />
            <TextField
              label="App Secret"
              fullWidth
              type="password"
              value={formData.appSecret}
              onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
