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
} from '@mui/material';
import { Add as AddIcon, Business as BusinessIcon } from '@mui/icons-material';
import axios from '../api/axiosInstance';

interface Tenant {
  id: number;
  tenantCode: string;
  companyName: string;
  companyEmail: string;
  isActive: boolean;
  createdAt: string;
  subscription?: {
    plan: {
      name: string;
    };
    endDate: string;
    isActive: boolean;
  };
}

interface SubscriptionPlan {
  id: number;
  name: string;
  monthlyPrice: number;
}

export const TenantManagement = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    adminUsername: '',
    adminPassword: '',
    subscriptionPlanId: '',
  });

  useEffect(() => {
    fetchTenants();
    fetchPlans();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await axios.get('/api/tenants');
      setTenants(response.data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setMessage('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/subscription-plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleCreateTenant = async () => {
    try {
      await axios.post('/api/tenants', formData);
      setMessage('Tenant created successfully');
      setOpenDialog(false);
      setFormData({
        companyName: '',
        companyEmail: '',
        adminUsername: '',
        adminPassword: '',
        subscriptionPlanId: '',
      });
      fetchTenants();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to create tenant');
    }
  };

  const handleToggleStatus = async (tenantId: number, currentStatus: boolean) => {
    try {
      await axios.put(`/api/tenants/${tenantId}/toggle`, {
        isActive: !currentStatus,
      });
      setMessage(`Tenant ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchTenants();
    } catch (error) {
      setMessage('Failed to toggle tenant status');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Tenant Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage client companies and their subscriptions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add New Client
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
              <TableCell>Company</TableCell>
              <TableCell>Tenant Code</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Subscription</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="primary" />
                    <Typography fontWeight="bold">{tenant.companyName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <code>{tenant.tenantCode}</code>
                </TableCell>
                <TableCell>{tenant.companyEmail}</TableCell>
                <TableCell>
                  {tenant.subscription ? (
                    <Chip
                      label={tenant.subscription.plan.name}
                      color="primary"
                      size="small"
                    />
                  ) : (
                    <Chip label="No Subscription" color="default" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  {tenant.subscription
                    ? new Date(tenant.subscription.endDate).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={tenant.isActive ? 'Active' : 'Inactive'}
                    color={tenant.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={tenant.isActive}
                    onChange={() => handleToggleStatus(tenant.id, tenant.isActive)}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Tenant Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Client Company</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Company Name"
              fullWidth
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <TextField
              label="Company Email"
              type="email"
              fullWidth
              value={formData.companyEmail}
              onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
            />
            <TextField
              label="Admin Username"
              fullWidth
              value={formData.adminUsername}
              onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
            />
            <TextField
              label="Admin Password"
              type="password"
              fullWidth
              value={formData.adminPassword}
              onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Subscription Plan</InputLabel>
              <Select
                value={formData.subscriptionPlanId}
                onChange={(e) =>
                  setFormData({ ...formData, subscriptionPlanId: e.target.value })
                }
                label="Subscription Plan"
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.monthlyPrice}/month
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTenant} variant="contained">
            Create Tenant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
