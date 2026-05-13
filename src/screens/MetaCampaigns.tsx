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

interface MetaCampaign {
  id: number;
  name: string;
  metaConfigId: number;
  metaConfigName?: string;
  platform: string;
  objective: string;
  dailyBudget: number;
  status: string;
  startDate?: string;
  endDate?: string;
}

export const MetaCampaigns = () => {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MetaCampaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metaConfigId: '',
    platform: 'FACEBOOK',
    objective: 'TRAFFIC',
    dailyBudget: '',
    totalBudget: '',
    headline: '',
    primaryText: '',
    description1: '',
    destinationUrl: '',
    callToAction: 'LEARN_MORE',
    imageUrl: '',
    videoUrl: '',
    targetLocations: '',
    targetAgeRange: '',
    targetGender: 'ALL',
    targetInterests: '',
    targetBehaviors: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchCampaigns();
    fetchConfigs();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/meta-campaigns');
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
      const response = await axios.get('/api/meta-configs');
      setConfigs(response.data.filter((c: any) => c.isActive));
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const handleOpenDialog = (campaign?: MetaCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        description: '',
        metaConfigId: campaign.metaConfigId.toString(),
        platform: campaign.platform,
        objective: campaign.objective,
        dailyBudget: campaign.dailyBudget.toString(),
        totalBudget: '',
        headline: '',
        primaryText: '',
        description1: '',
        destinationUrl: '',
        callToAction: 'LEARN_MORE',
        imageUrl: '',
        videoUrl: '',
        targetLocations: '',
        targetAgeRange: '',
        targetGender: 'ALL',
        targetInterests: '',
        targetBehaviors: '',
        startDate: campaign.startDate || '',
        endDate: campaign.endDate || '',
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: '',
        description: '',
        metaConfigId: '',
        platform: 'FACEBOOK',
        objective: 'TRAFFIC',
        dailyBudget: '',
        totalBudget: '',
        headline: '',
        primaryText: '',
        description1: '',
        destinationUrl: '',
        callToAction: 'LEARN_MORE',
        imageUrl: '',
        videoUrl: '',
        targetLocations: '',
        targetAgeRange: '',
        targetGender: 'ALL',
        targetInterests: '',
        targetBehaviors: '',
        startDate: '',
        endDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingCampaign) {
        await axios.put(`/api/meta-campaigns/${editingCampaign.id}`, formData);
        setMessage('Campaign updated successfully');
      } else {
        await axios.post('/api/meta-campaigns', formData);
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
        await axios.delete(`/api/meta-campaigns/${id}`);
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
            Meta Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your Facebook & Instagram campaigns
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
              <TableCell>Platform</TableCell>
              <TableCell>Objective</TableCell>
              <TableCell>Daily Budget</TableCell>
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
                <TableCell>{campaign.metaConfigName || `Config #${campaign.metaConfigId}`}</TableCell>
                <TableCell>
                  <Chip label={campaign.platform} size="small" color="primary" />
                </TableCell>
                <TableCell>
                  <Chip label={campaign.objective.replace('_', ' ')} size="small" variant="outlined" />
                </TableCell>
                <TableCell>${campaign.dailyBudget}</TableCell>
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
              <InputLabel>Meta Config</InputLabel>
              <Select
                value={formData.metaConfigId}
                onChange={(e) => setFormData({ ...formData, metaConfigId: e.target.value })}
                label="Meta Config"
              >
                {configs.map((config) => (
                  <MenuItem key={config.id} value={config.id}>
                    {config.name} (Page: {config.facebookPageId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                label="Platform"
              >
                <MenuItem value="FACEBOOK">Facebook</MenuItem>
                <MenuItem value="INSTAGRAM">Instagram</MenuItem>
                <MenuItem value="BOTH">Both</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Campaign Objective</InputLabel>
              <Select
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                label="Campaign Objective"
              >
                <MenuItem value="TRAFFIC">Traffic</MenuItem>
                <MenuItem value="CONVERSIONS">Conversions</MenuItem>
                <MenuItem value="BRAND_AWARENESS">Brand Awareness</MenuItem>
                <MenuItem value="LEAD_GENERATION">Lead Generation</MenuItem>
                <MenuItem value="APP_INSTALLS">App Installs</MenuItem>
                <MenuItem value="VIDEO_VIEWS">Video Views</MenuItem>
                <MenuItem value="ENGAGEMENT">Engagement</MenuItem>
                <MenuItem value="MESSAGES">Messages</MenuItem>
                <MenuItem value="STORE_TRAFFIC">Store Traffic</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Daily Budget"
              fullWidth
              type="number"
              value={formData.dailyBudget}
              onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
            />
            <TextField
              label="Total Budget (Optional)"
              fullWidth
              type="number"
              value={formData.totalBudget}
              onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
            />
            <TextField
              label="Headline"
              fullWidth
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            />
            <TextField
              label="Primary Text"
              fullWidth
              multiline
              rows={3}
              value={formData.primaryText}
              onChange={(e) => setFormData({ ...formData, primaryText: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              value={formData.description1}
              onChange={(e) => setFormData({ ...formData, description1: e.target.value })}
            />
            <TextField
              label="Destination URL"
              fullWidth
              value={formData.destinationUrl}
              onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Call to Action</InputLabel>
              <Select
                value={formData.callToAction}
                onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                label="Call to Action"
              >
                <MenuItem value="LEARN_MORE">Learn More</MenuItem>
                <MenuItem value="SHOP_NOW">Shop Now</MenuItem>
                <MenuItem value="SIGN_UP">Sign Up</MenuItem>
                <MenuItem value="DOWNLOAD">Download</MenuItem>
                <MenuItem value="BOOK_NOW">Book Now</MenuItem>
                <MenuItem value="CONTACT_US">Contact Us</MenuItem>
                <MenuItem value="GET_QUOTE">Get Quote</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Image URL"
              fullWidth
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
            <TextField
              label="Video URL (Optional)"
              fullWidth
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            />
            <TextField
              label="Target Locations (comma separated)"
              fullWidth
              value={formData.targetLocations}
              onChange={(e) => setFormData({ ...formData, targetLocations: e.target.value })}
              placeholder="United States, Canada, United Kingdom"
            />
            <TextField
              label="Target Age Range"
              fullWidth
              value={formData.targetAgeRange}
              onChange={(e) => setFormData({ ...formData, targetAgeRange: e.target.value })}
              placeholder="18-65"
            />
            <FormControl fullWidth>
              <InputLabel>Target Gender</InputLabel>
              <Select
                value={formData.targetGender}
                onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
                label="Target Gender"
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Target Interests (comma separated)"
              fullWidth
              value={formData.targetInterests}
              onChange={(e) => setFormData({ ...formData, targetInterests: e.target.value })}
              placeholder="Technology, Sports, Travel"
            />
            <TextField
              label="Target Behaviors (comma separated)"
              fullWidth
              value={formData.targetBehaviors}
              onChange={(e) => setFormData({ ...formData, targetBehaviors: e.target.value })}
              placeholder="Online shoppers, Frequent travelers"
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
