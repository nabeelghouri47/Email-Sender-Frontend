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

interface AdsCampaign {
  id: number;
  name: string;
  adsConfigId: number;
  adsConfigName?: string;
  campaignType: string;
  budget: number;
  status: string;
  startDate?: string;
  endDate?: string;
}

export const AdsCampaigns = () => {
  const [campaigns, setCampaigns] = useState<AdsCampaign[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdsCampaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    adsConfigId: '',
    campaignType: 'SEARCH',
    budget: '',
    dailyBudget: '',
    targetAudience: '',
    keywords: '',
    adCopy: '',
    landingPageUrl: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchCampaigns();
    fetchConfigs();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/ads-campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setMessage('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      const response = await axios.get('/api/ads-configs');
      setConfigs(response.data.filter((c: any) => c.isActive));
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const handleOpenDialog = (campaign?: AdsCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        description: '',
        adsConfigId: campaign.adsConfigId.toString(),
        campaignType: campaign.campaignType,
        budget: campaign.budget.toString(),
        dailyBudget: '',
        targetAudience: '',
        keywords: '',
        adCopy: '',
        landingPageUrl: '',
        startDate: campaign.startDate || '',
        endDate: campaign.endDate || '',
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: '',
        description: '',
        adsConfigId: '',
        campaignType: 'SEARCH',
        budget: '',
        dailyBudget: '',
        targetAudience: '',
        keywords: '',
        adCopy: '',
        landingPageUrl: '',
        startDate: '',
        endDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingCampaign) {
        await axios.put(`/api/ads-campaigns/${editingCampaign.id}`, formData);
        setMessage('Campaign updated successfully');
      } else {
        await axios.post('/api/ads-campaigns', formData);
        setMessage('Campaign created successfully');
      }
      setOpenDialog(false);
      fetchCampaigns();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to save campaign');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await axios.delete(`/api/ads-campaigns/${id}`);
        setMessage('Campaign deleted successfully');
        fetchCampaigns();
      } catch (error) {
        setMessage('Failed to delete campaign');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'DRAFT':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Ads Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your advertising campaigns
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Create Campaign
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
              <TableCell>Config</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>{campaign.name}</TableCell>
                <TableCell>{campaign.adsConfigName || `Config #${campaign.adsConfigId}`}</TableCell>
                <TableCell>
                  <Chip label={campaign.campaignType} size="small" />
                </TableCell>
                <TableCell>${campaign.budget}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={campaign.status}
                    color={getStatusColor(campaign.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpenDialog(campaign)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(campaign.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Campaign Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Ads Config</InputLabel>
              <Select
                value={formData.adsConfigId}
                onChange={(e) => setFormData({ ...formData, adsConfigId: e.target.value })}
                label="Ads Config"
              >
                {configs.map((config) => (
                  <MenuItem key={config.id} value={config.id}>
                    {config.name} ({config.platform})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Campaign Type</InputLabel>
              <Select
                value={formData.campaignType}
                onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                label="Campaign Type"
              >
                <MenuItem value="SEARCH">Search</MenuItem>
                <MenuItem value="DISPLAY">Display</MenuItem>
                <MenuItem value="VIDEO">Video</MenuItem>
                <MenuItem value="SHOPPING">Shopping</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Total Budget"
              fullWidth
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
            <TextField
              label="Daily Budget"
              fullWidth
              type="number"
              value={formData.dailyBudget}
              onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
            />
            <TextField
              label="Target Audience"
              fullWidth
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            />
            <TextField
              label="Keywords (comma separated)"
              fullWidth
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            />
            <TextField
              label="Ad Copy"
              fullWidth
              multiline
              rows={3}
              value={formData.adCopy}
              onChange={(e) => setFormData({ ...formData, adCopy: e.target.value })}
            />
            <TextField
              label="Landing Page URL"
              fullWidth
              value={formData.landingPageUrl}
              onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
            />
            <TextField
              label="Start Date"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <TextField
              label="End Date"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCampaign ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
