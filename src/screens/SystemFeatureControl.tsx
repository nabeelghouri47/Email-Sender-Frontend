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
} from '@mui/material';
import axios from '../api/axiosInstance';

interface Feature {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

export const SystemFeatureControl = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await axios.get('/api/system-control/features');
      setFeatures(response.data);
    } catch (error) {
      console.error('Error fetching features:', error);
      setMessage('Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (featureId: number, currentStatus: boolean) => {
    try {
      await axios.put(`/api/system-control/features/${featureId}/toggle`, {
        isActive: !currentStatus,
      });
      setMessage(`Feature ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      fetchFeatures();
    } catch (error) {
      console.error('Error toggling feature:', error);
      setMessage('Failed to toggle feature');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      CAMPAIGN: 'primary',
      CONFIGURATION: 'secondary',
      DELIVERABILITY: 'warning',
      ADVANCED: 'success',
    };
    return colors[category] || 'default';
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Feature Control
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enable or disable features globally. Disabled features will not be available to any users.
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
              <TableCell>Feature Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature.id}>
                <TableCell>{feature.name}</TableCell>
                <TableCell>
                  <code>{feature.code}</code>
                </TableCell>
                <TableCell>{feature.description}</TableCell>
                <TableCell>
                  <Chip
                    label={feature.category}
                    color={getCategoryColor(feature.category) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={feature.isActive ? 'Active' : 'Disabled'}
                    color={feature.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={feature.isActive}
                    onChange={() => handleToggle(feature.id, feature.isActive)}
                    color="primary"
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
