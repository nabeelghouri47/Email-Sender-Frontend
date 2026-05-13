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

interface YouTubeConfig {
  id: number;
  name: string;
  channelId: string;
  isActive: boolean;
}

export const YouTubeConfigs = () => {
  const [configs, setConfigs] = useState<YouTubeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<YouTubeConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    channelId: '',
    apiKey: '',
    clientId: '',
    clientSecret: '',
    refreshToken: '',
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await axios.get('/api/youtube-configs');
      setConfigs(response.data);
    } catch (error) {
      console.error('Error fetching configs:', error);
      setMessage('Failed to load configs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (config?: YouTubeConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        channelId: config.channelId,
        apiKey: '',
        clientId: '',
        clientSecret: '',
        refreshToken: '',
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        channelId: '',
        apiKey: '',
        clientId: '',
        clientSecret: '',
        refreshToken: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingConfig) {
        await axios.put(`/api/youtube-configs/${editingConfig.id}`, formData);
        setMessage('Config updated successfully');
      } else {
        await axios.post('/api/youtube-configs', formData);
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
        await axios.delete(`/api/youtube-configs/${id}`);
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
            YouTube Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your YouTube channel credentials
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
              <TableCell>Channel ID</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.name}</TableCell>
                <TableCell>{config.channelId}</TableCell>
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
              label="Channel ID"
              fullWidth
              value={formData.channelId}
              onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
            />
            <TextField
              label="API Key"
              fullWidth
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            />
            <TextField
              label="Client ID"
              fullWidth
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            />
            <TextField
              label="Client Secret"
              fullWidth
              type="password"
              value={formData.clientSecret}
              onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
            />
            <TextField
              label="Refresh Token"
              fullWidth
              type="password"
              value={formData.refreshToken}
              onChange={(e) => setFormData({ ...formData, refreshToken: e.target.value })}
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
