import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip, Grid } from '@mui/material';
import { Add, Edit, Delete, Facebook, Instagram } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';
import { metaConfigApi } from '../api/endpoints';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  facebookPageId: Yup.string().required('Facebook Page ID is required'),
  facebookAccessToken: Yup.string().required('Access Token is required'),
});

const MetaConfigs = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await metaConfigApi.getAll();
      setConfigs(res.data);
    } catch {
      toast.error('Failed to fetch Meta configs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingConfig) {
        await metaConfigApi.update(editingConfig.id, values);
        toast.success('Config updated');
      } else {
        await metaConfigApi.create(values);
        toast.success('Meta account configured successfully');
      }
      setShowModal(false);
      setEditingConfig(null);
      fetchConfigs();
    } catch {
      toast.error('Failed to save config');
    }
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this Meta config?')) return;
    try {
      await metaConfigApi.delete(id);
      toast.success('Deleted');
      fetchConfigs();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 60 },
    { id: 'name', label: 'Account Name', minWidth: 180 },
    { id: 'facebookPageId', label: 'Facebook Page ID', minWidth: 160 },
    {
      id: 'instagramEnabled',
      label: 'Instagram',
      minWidth: 120,
      format: (val: boolean, row: any) => val
        ? <Chip icon={<Instagram />} label={row.instagramAccountId || 'Enabled'} color="secondary" size="small" />
        : <Chip label="Not linked" size="small" />,
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

  const initialValues = editingConfig
    ? { ...editingConfig, facebookAccessToken: '' } // clear masked token on edit
    : { name: '', facebookPageId: '', facebookAccessToken: '', instagramAccountId: '', instagramEnabled: false, isActive: true };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Facebook sx={{ color: '#1877F2' }} />
            <Instagram sx={{ color: '#E4405F' }} />
            Meta Configurations
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Configure your Facebook Pages and Instagram accounts for social posting
          </Typography>
        </Box>
        <Button startIcon={<Add />} onClick={() => { setEditingConfig(null); setShowModal(true); }}>
          Add Meta Account
        </Button>
      </Box>

      <DataTable columns={columns} data={configs} loading={loading} />

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingConfig(null); }}
        title={editingConfig ? 'Edit Meta Config' : 'Add Meta Account'}
        maxWidth="sm"
      >
        <Formik
          key={editingConfig?.id ?? 'new'}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField name="name" label="Account Name" fullWidth placeholder="My Business Page" />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#1877F2', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Facebook fontSize="small" /> Facebook
                  </Typography>
                  <TextField name="facebookPageId" label="Facebook Page ID" fullWidth placeholder="123456789012345" />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="facebookAccessToken"
                    label="Page Access Token"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Paste your long-lived page access token from Meta Developer Console"
                    helperText="Get this from Meta for Developers → Your App → Graph API Explorer"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#E4405F', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Instagram fontSize="small" /> Instagram (Optional)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <input
                      type="checkbox"
                      id="instagramEnabled"
                      checked={values.instagramEnabled}
                      onChange={e => setFieldValue('instagramEnabled', e.target.checked)}
                    />
                    <label htmlFor="instagramEnabled">Enable Instagram posting</label>
                  </Box>
                  {values.instagramEnabled && (
                    <TextField
                      name="instagramAccountId"
                      label="Instagram Business Account ID"
                      fullWidth
                      placeholder="Instagram account ID linked to your Facebook Page"
                      helperText="Find this in Meta Business Suite → Instagram Account Settings"
                    />
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
                    <Button variant="outlined" onClick={() => { setShowModal(false); setEditingConfig(null); }}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained">
                      {editingConfig ? 'Update' : 'Save Config'}
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

export default MetaConfigs;
