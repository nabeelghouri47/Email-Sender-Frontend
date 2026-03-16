<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Add, Delete, Block } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { deliverabilityApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { DataTable } from '../components/common/DataTable';
import { Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  reason: Yup.string().required('Reason is required'),
});

const SuppressionList = () => {
  const [suppressions, setSuppressions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSuppressions();
  }, []);

  const fetchSuppressions = async () => {
    setLoading(true);
    try {
      const response = await deliverabilityApi.getSuppressionList();
      setSuppressions(response.data);
    } catch (error) {
      toast.error('Failed to fetch suppression list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      await deliverabilityApi.suppressEmail(values);
      toast.success('Email added to suppression list!');
      setShowModal(false);
      resetForm();
      fetchSuppressions();
    } catch (error) {
      toast.error('Failed to suppress email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Remove this email from suppression list?')) {
      try {
        await deliverabilityApi.removeFromSuppression(id);
        toast.success('Email removed from suppression list!');
        fetchSuppressions();
      } catch (error) {
        toast.error('Failed to remove email');
      }
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'BOUNCE': return 'error';
      case 'SPAM_COMPLAINT': return 'warning';
      case 'UNSUBSCRIBE': return 'info';
      case 'MANUAL': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    { id: 'email', label: 'Email Address', minWidth: 250 },
    {
      id: 'reason',
      label: 'Reason',
      minWidth: 150,
      format: (value: string) => (
        <Chip label={value} color={getReasonColor(value) as any} size="small" />
      ),
    },
    {
      id: 'isGlobal',
      label: 'Scope',
      minWidth: 100,
      format: (value: boolean) => (
        <Chip label={value ? 'Global' : 'User'} size="small" variant="outlined" />
      ),
    },
    { id: 'notes', label: 'Notes', minWidth: 200, format: (v: any) => v || '-' },
    {
      id: 'createdAt',
      label: 'Added',
      minWidth: 150,
      format: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      format: (_: any, row: any) => (
        <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#EF4444' }}>
          <Delete fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Suppression List
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Emails in this list will not receive any campaigns
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
          Add Email
        </Button>
      </Box>

      <DataTable columns={columns} data={suppressions} loading={loading} />

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Block sx={{ color: '#EF4444' }} />
            <Typography variant="h6">Add to Suppression List</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              email: '',
              reason: 'MANUAL',
              notes: '',
              isGlobal: false,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3} mt={2}>
                  <TextField name="email" label="Email Address" type="email" />

                  <FormControl fullWidth>
                    <InputLabel>Reason</InputLabel>
                    <Select
                      value={values.reason}
                      onChange={(e) => setFieldValue('reason', e.target.value)}
                      label="Reason"
                    >
                      <MenuItem value="MANUAL">Manual</MenuItem>
                      <MenuItem value="BOUNCE">Bounce</MenuItem>
                      <MenuItem value="SPAM_COMPLAINT">Spam Complaint</MenuItem>
                      <MenuItem value="UNSUBSCRIBE">Unsubscribe</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField name="notes" label="Notes (optional)" multiline rows={3} />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.isGlobal}
                        onChange={(e) => setFieldValue('isGlobal', e.target.checked)}
                      />
                    }
                    label="Global suppression (affects all users)"
                  />

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      Add to List
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SuppressionList;
=======
import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Add, Delete, Block } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { deliverabilityApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { DataTable } from '../components/common/DataTable';
import { Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  reason: Yup.string().required('Reason is required'),
});

const SuppressionList = () => {
  const [suppressions, setSuppressions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSuppressions();
  }, []);

  const fetchSuppressions = async () => {
    setLoading(true);
    try {
      const response = await deliverabilityApi.getSuppressionList();
      setSuppressions(response.data);
    } catch (error) {
      toast.error('Failed to fetch suppression list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      await deliverabilityApi.suppressEmail(values);
      toast.success('Email added to suppression list!');
      setShowModal(false);
      resetForm();
      fetchSuppressions();
    } catch (error) {
      toast.error('Failed to suppress email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Remove this email from suppression list?')) {
      try {
        await deliverabilityApi.removeFromSuppression(id);
        toast.success('Email removed from suppression list!');
        fetchSuppressions();
      } catch (error) {
        toast.error('Failed to remove email');
      }
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'BOUNCE': return 'error';
      case 'SPAM_COMPLAINT': return 'warning';
      case 'UNSUBSCRIBE': return 'info';
      case 'MANUAL': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    { id: 'email', label: 'Email Address', minWidth: 250 },
    {
      id: 'reason',
      label: 'Reason',
      minWidth: 150,
      format: (value: string) => (
        <Chip label={value} color={getReasonColor(value) as any} size="small" />
      ),
    },
    {
      id: 'isGlobal',
      label: 'Scope',
      minWidth: 100,
      format: (value: boolean) => (
        <Chip label={value ? 'Global' : 'User'} size="small" variant="outlined" />
      ),
    },
    { id: 'notes', label: 'Notes', minWidth: 200, format: (v: any) => v || '-' },
    {
      id: 'createdAt',
      label: 'Added',
      minWidth: 150,
      format: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      format: (_: any, row: any) => (
        <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#EF4444' }}>
          <Delete fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Suppression List
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Emails in this list will not receive any campaigns
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
          Add Email
        </Button>
      </Box>

      <DataTable columns={columns} data={suppressions} loading={loading} />

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Block sx={{ color: '#EF4444' }} />
            <Typography variant="h6">Add to Suppression List</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              email: '',
              reason: 'MANUAL',
              notes: '',
              isGlobal: false,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3} mt={2}>
                  <TextField name="email" label="Email Address" type="email" />

                  <FormControl fullWidth>
                    <InputLabel>Reason</InputLabel>
                    <Select
                      value={values.reason}
                      onChange={(e) => setFieldValue('reason', e.target.value)}
                      label="Reason"
                    >
                      <MenuItem value="MANUAL">Manual</MenuItem>
                      <MenuItem value="BOUNCE">Bounce</MenuItem>
                      <MenuItem value="SPAM_COMPLAINT">Spam Complaint</MenuItem>
                      <MenuItem value="UNSUBSCRIBE">Unsubscribe</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField name="notes" label="Notes (optional)" multiline rows={3} />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.isGlobal}
                        onChange={(e) => setFieldValue('isGlobal', e.target.checked)}
                      />
                    }
                    label="Global suppression (affects all users)"
                  />

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      Add to List
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SuppressionList;
>>>>>>> 5e525f2 (Frontend updated)
