import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, Grid, Tooltip } from '@mui/material';
import { Add, Edit, Delete, Star } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';
import { subscriptionApi } from '../api/endpoints';

const validationSchema = Yup.object({
  name: Yup.string().required('Plan name is required'),
  monthlyPrice: Yup.number().min(0).required('Monthly price is required'),
  yearlyPrice: Yup.number().min(0).required('Yearly price is required'),
});

const SubscriptionManagement = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await subscriptionApi.getAllPlans();
      setPlans(res.data);
    } catch {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPlan) {
        await subscriptionApi.updatePlan(editingPlan.id, values);
        toast.success('Plan updated');
      } else {
        await subscriptionApi.createPlan(values);
        toast.success('Plan created');
      }
      setShowModal(false);
      setEditingPlan(null);
      fetchPlans();
    } catch {
      toast.error('Failed to save plan');
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await subscriptionApi.deletePlan(id);
      toast.success('Plan deleted');
      fetchPlans();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 60 },
    {
      id: 'name',
      label: 'Plan Name',
      minWidth: 150,
      format: (val: string, row: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {val}
          {row.isPopular && <Star sx={{ color: '#FFD700', fontSize: 18 }} />}
        </Box>
      ),
    },
    { id: 'description', label: 'Description', minWidth: 200 },
    {
      id: 'monthlyPrice',
      label: 'Monthly',
      minWidth: 100,
      format: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      id: 'yearlyPrice',
      label: 'Yearly',
      minWidth: 100,
      format: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      id: 'featureNames',
      label: 'Features',
      minWidth: 200,
      format: (val: string[]) => val?.length || 0,
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 100,
      format: (val: boolean) => (
        <Chip label={val ? 'Active' : 'Inactive'} color={val ? 'success' : 'default'} size="small" />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      format: (_: any, row: any) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(row)}><Edit /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}><Delete /></IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const initialValues = editingPlan || {
    name: '',
    description: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    emailCampaignLimit: null,
    metaCampaignLimit: null,
    adsCampaignLimit: null,
    youtubeCampaignLimit: null,
    tiktokCampaignLimit: null,
    monthlyEmailLimit: null,
    isActive: true,
    isPopular: false,
    displayOrder: 0,
    featureCodes: [],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">Subscription Plans</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Manage subscription plans and pricing
          </Typography>
        </Box>
        <Button startIcon={<Add />} onClick={() => { setEditingPlan(null); setShowModal(true); }}>
          Create Plan
        </Button>
      </Box>

      <DataTable columns={columns} data={plans} loading={loading} />

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingPlan(null); }}
        title={editingPlan ? 'Edit Plan' : 'Create Plan'}
        maxWidth="md"
      >
        <Formik
          key={editingPlan?.id ?? 'new'}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {() => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField name="name" label="Plan Name" fullWidth placeholder="Pro" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="displayOrder" label="Display Order" type="number" fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField name="description" label="Description" fullWidth multiline rows={2} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="monthlyPrice" label="Monthly Price ($)" type="number" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="yearlyPrice" label="Yearly Price ($)" type="number" fullWidth />
                </Grid>

                <Grid item xs={12}><Typography variant="h6" sx={{ mt: 1 }}>Campaign Limits (null = unlimited)</Typography></Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="emailCampaignLimit" label="Email Campaigns" type="number" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="metaCampaignLimit" label="Meta Campaigns" type="number" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="adsCampaignLimit" label="Ads Campaigns" type="number" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="youtubeCampaignLimit" label="YouTube Campaigns" type="number" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="tiktokCampaignLimit" label="TikTok Campaigns" type="number" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="monthlyEmailLimit" label="Monthly Emails" type="number" fullWidth />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button variant="outlined" onClick={() => { setShowModal(false); setEditingPlan(null); }}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained">
                      {editingPlan ? 'Update' : 'Create'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Modal>
    </Box>
  );
};

export default SubscriptionManagement;
