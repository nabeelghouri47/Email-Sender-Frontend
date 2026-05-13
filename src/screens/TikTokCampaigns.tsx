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

interface TikTokCampaign {
  id: number;
  name: string;
  tiktokConfigId: number;
  tiktokConfigName?: string;
  campaignType: string;
  budget: number;
  status: string;
  startDate?: string;
  endDate?: string;
}

export const TikTokCampaigns = () => {
  const [campaigns, setCampaigns] = useState<TikTokCampaign[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<TikTokCampaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tiktokConfigId: '',
    campaignType: 'IN_FEED',
    budget: '',
    targetAudience: '',
    videoUrl: '',
    videoCaption: '',
    hashtags: '',
    callToAction: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchCampaigns();
    fetchConfigs();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/tiktok-campaigns');
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
      const response = await axios.get('/api/tiktok-configs');
      setConfigs(response.data.filter((c: any) => c.isActive));
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const handleOpenDialog = (campaign?: TikTokCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        description: '',
        tiktokConfigId: campaign.tiktokConfigId.toString(),
        campaignType: campaign.campaignType,
        budget: campaign.budget.toString(),
        targetAudience: '',
        videoUrl: '',
        videoCaption: '',
        hashtags: '',
        callToAction: '',
        startDate: campaign.startDate || '',
        endDate: campaign.endDate || '',
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: '',
        description: '',
        tiktokConfigId: '',
        campaignType: 'IN_FEED',
        budget: '',
        targetAudience: '',
        videoUrl: '',
        videoCaption: '',
        hashtags: '',
        callToAction: '',
        startDate: '',
        endDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingCampaign) {
        await axios.put(`/api/tiktok-campaigns/${editingCampaign.id}`, formData);
        setMessage('Campaign updated successfully');
      } else {
        await axios.post('/api/tiktok-campaigns', formData);
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
        await axios.delete(`/api/tiktok-campaigns/${id}`);
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
            TikTok Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your TikTok video campaigns
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
                <TableCell>{campaign.tiktokConfigName || `Config #${campaign.tiktokConfigId}`}</TableCell>
                <TableCell>
                  <Chip label={campaign.campaignType.replace('_', ' ')} size="small" />
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
              <InputLabel>TikTok Config</InputLabel>
              <Select
                value={formData.tiktokConfigId}
                onChange={(e) => setFormData({ ...formData, tiktokConfigId: e.target.value })}
                label="TikTok Config"
              >
                {configs.map((config) => (
                  <MenuItem key={config.id} value={config.id}>
                    {config.name} ({config.accountId})
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
                <MenuItem value="IN_FEED">In-Feed Ads</MenuItem>
                <MenuItem value="TOP_VIEW">TopView</MenuItem>
                <MenuItem value="BRAND_TAKEOVER">Brand Takeover</MenuItem>
                <MenuItem value="HASHTAG_CHALLENGE">Hashtag Challenge</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Budget"
              fullWidth
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
            <TextField
              label="Target Audience"
              fullWidth
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            />
            <TextField
              label="Video URL"
              fullWidth
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            />
            <TextField
              label="Video Caption"
              fullWidth
              multiline
              rows={3}
              value={formData.videoCaption}
              onChange={(e) => setFormData({ ...formData, videoCaption: e.target.value })}
            />
            <TextField
              label="Hashtags (comma separated)"
              fullWidth
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
            />
            <TextField
              label="Call to Action"
              fullWidth
              value={formData.callToAction}
              onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
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
