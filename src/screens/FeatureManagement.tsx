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
  Switch,
  Chip,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../api/axiosInstance';

interface Feature {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

export const FeatureManagement = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'CAMPAIGN',
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await axios.get('/api/features');
      setFeatures(response.data);
    } catch (error) {
      console.error('Error fetching features:', error);
      setMessage('Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (feature?: Feature) => {
    if (feature) {
      setEditingFeature(feature);
      setFormData({
        code: feature.code,
        name: feature.name,
        description: feature.description,
        category: feature.category,
      });
    } else {
      setEditingFeature(null);
      setFormData({ code: '', name: '', description: '', category: 'CAMPAIGN' });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingFeature) {
        await axios.put(`/api/features/${editingFeature.id}`, formData);
        setMessage('Feature updated successfully');
      } else {
        await axios.post('/api/features', formData);
        setMessage('Feature created successfully');
      }
      setOpenDialog(false);
      fetchFeatures();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to save feature');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        await axios.delete(`/api/features/${id}`);
        setMessage('Feature deleted successfully');
        fetchFeatures();
      } catch (error) {
        setMessage('Failed to delete feature');
      }
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await axios.put(`/api/features/${id}/toggle`, { isActive: !currentStatus });
      setMessage(`Feature ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      fetchFeatures();
    } catch (error) {
      setMessage('Failed to toggle feature');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Feature Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage system features
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Feature
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
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature.id}>
                <TableCell><code>{feature.code}</code></TableCell>
                <TableCell>{feature.name}</TableCell>
                <TableCell>{feature.description}</TableCell>
                <TableCell>
                  <Chip label={feature.category} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={feature.isActive}
                    onChange={() => handleToggle(feature.id, feature.isActive)}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpenDialog(feature)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(feature.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFeature ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Code"
              fullWidth
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              disabled={!!editingFeature}
            />
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="CAMPAIGN">Campaign</MenuItem>
                <MenuItem value="CONFIGURATION">Configuration</MenuItem>
                <MenuItem value="DELIVERABILITY">Deliverability</MenuItem>
                <MenuItem value="ADVANCED">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingFeature ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
