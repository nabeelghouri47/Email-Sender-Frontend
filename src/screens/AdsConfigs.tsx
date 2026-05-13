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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../api/axiosInstance';

interface AdsConfig {
  id: number;
  name: string;
  platform: string;
  googleAdsCustomerId?: string;
  facebookAdAccountId?: string;
  linkedinAdAccountId?: string;
  isActive: boolean;
}

export const AdsConfigs = () => {
  const [configs, setConfigs] = useState<AdsConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AdsConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'GOOGLE_ADS',
    googleAdsCustomerId: '',
    googleAdsApiKey: '',
    googleAdsRefreshToken: '',
    facebookAdAccountId: '',
    facebookAccessToken: '',
    facebookPixelId: '',
    linkedinAdAccountId: '',
    linkedinAccessToken: '',
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await axios.get('/api/ads-configs');
      setConfigs(response.data);
    } catch (error) {
      console.error('Error fetching configs:', error);
      setMessage('Failed to load configs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (config?: AdsConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        platform: config.platform,
        googleAdsCustomerId: config.googleAdsCustomerId || '',
        googleAdsApiKey: '',
        googleAdsRefreshToken: '',
        facebookAdAccountId: config.facebookAdAccountId || '',
        facebookAccessToken: '',
        facebookPixelId: '',
        linkedinAdAccountId: config.linkedinAdAccountId || '',
        linkedinAccessToken: '',
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        platform: 'GOOGLE_ADS',
        googleAdsCustomerId: '',
        googleAdsApiKey: '',
        googleAdsRefreshToken: '',
        facebookAdAccountId: '',
        facebookAccessToken: '',
        facebookPixelId: '',
        linkedinAdAccountId: '',
        linkedinAccessToken: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingConfig) {
        await axios.put(`/api/ads-configs/${editingConfig.id}`, formData);
        setMessage('Config updated successfully');
      } else {
        await axios.post('/api/ads-configs', formData);
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
        await axios.delete(`/api/ads-configs/${id}`);
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
            Ads Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your advertising platform credentials
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
              <TableCell>Platform</TableCell>
              <TableCell>Account ID</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.name}</TableCell>
                <TableCell>
                  <Chip label={config.platform.replace('_', ' ')} size="small" color="primary" />
                </TableCell>
                <TableCell>
                  {config.googleAdsCustomerId || config.facebookAdAccountId || config.linkedinAdAccountId || 'N/A'}
                </TableCell>
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
            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                label="Platform"
              >
                <MenuItem value="GOOGLE_ADS">Google Ads</MenuItem>
                <MenuItem value="FACEBOOK_ADS">Facebook Ads</MenuItem>
                <MenuItem value="LINKEDIN_ADS">LinkedIn Ads</MenuItem>
              </Select>
            </FormControl>

            {formData.platform === 'GOOGLE_ADS' && (
              <>
                <TextField
                  label="Customer ID"
                  fullWidth
                  value={formData.googleAdsCustomerId}
                  onChange={(e) => setFormData({ ...formData, googleAdsCustomerId: e.target.value })}
                />
                <TextField
                  label="API Key"
                  fullWidth
                  type="password"
                  value={formData.googleAdsApiKey}
                  onChange={(e) => setFormData({ ...formData, googleAdsApiKey: e.target.value })}
                />
                <TextField
                  label="Refresh Token"
                  fullWidth
                  type="password"
                  value={formData.googleAdsRefreshToken}
                  onChange={(e) => setFormData({ ...formData, googleAdsRefreshToken: e.target.value })}
                />
              </>
            )}

            {formData.platform === 'FACEBOOK_ADS' && (
              <>
                <TextField
                  label="Ad Account ID"
                  fullWidth
                  value={formData.facebookAdAccountId}
                  onChange={(e) => setFormData({ ...formData, facebookAdAccountId: e.target.value })}
                />
                <TextField
                  label="Access Token"
                  fullWidth
                  type="password"
                  value={formData.facebookAccessToken}
                  onChange={(e) => setFormData({ ...formData, facebookAccessToken: e.target.value })}
                />
                <TextField
                  label="Pixel ID (Optional)"
                  fullWidth
                  value={formData.facebookPixelId}
                  onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                />
              </>
            )}

            {formData.platform === 'LINKEDIN_ADS' && (
              <>
                <TextField
                  label="Ad Account ID"
                  fullWidth
                  value={formData.linkedinAdAccountId}
                  onChange={(e) => setFormData({ ...formData, linkedinAdAccountId: e.target.value })}
                />
                <TextField
                  label="Access Token"
                  fullWidth
                  type="password"
                  value={formData.linkedinAccessToken}
                  onChange={(e) => setFormData({ ...formData, linkedinAccessToken: e.target.value })}
                />
              </>
            )}
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
