import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, LinearProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Edit, Delete, HealthAndSafety, Dns, Info } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { emailConfigApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';
import { FormControlLabel, Checkbox } from '@mui/material';

const validationSchema = Yup.object({
  smtpHost: Yup.string().required('SMTP Host is required'),
  smtpPort: Yup.number().required('SMTP Port is required'),
  senderEmail: Yup.string().email('Invalid email').required('Sender email is required'),
  senderPassword: Yup.string().when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Password is required'),
  }),
});

const EmailConfigs = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showDnsModal, setShowDnsModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [domainHealth, setDomainHealth] = useState<any>(null);
  const [dnsGuide, setDnsGuide] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await emailConfigApi.getAllConfigs();
      setConfigs(response.data);
    } catch (error) {
      toast.error('Failed to fetch configs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (editingConfig) {
        await emailConfigApi.updateConfig(editingConfig.id, values);
        toast.success('Config updated successfully!');
      } else {
        await emailConfigApi.createConfig(values);
        toast.success('Config created successfully!');
      }
      setShowModal(false);
      setEditingConfig(null);
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to save config');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this config?')) {
      try {
        await emailConfigApi.deleteConfig(id);
        toast.success('Config deleted successfully!');
        fetchConfigs();
      } catch (error) {
        toast.error('Failed to delete config');
      }
    }
  };

  const handleViewHealth = async (config: any) => {
    setSelectedConfig(config);
    setLoadingHealth(true);
    setShowHealthModal(true);
    try {
      const response = await emailConfigApi.getDomainHealth(config.id);
      setDomainHealth(response.data);
    } catch (error) {
      toast.error('Failed to fetch domain health');
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleViewDns = async (config: any) => {
    setSelectedConfig(config);
    setShowDnsModal(true);
    try {
      const response = await emailConfigApi.getDnsSetupGuide(config.id);
      setDnsGuide(response.data);
    } catch (error) {
      toast.error('Failed to fetch DNS guide');
    }
  };

  const handleUpdateDns = async (field: string, value: boolean) => {
    if (!selectedConfig) return;
    try {
      await emailConfigApi.updateDnsConfiguration(selectedConfig.id, {
        [field]: value,
      });
      toast.success('DNS configuration updated!');
      // Refresh DNS guide
      const response = await emailConfigApi.getDnsSetupGuide(selectedConfig.id);
      setDnsGuide(response.data);
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to update DNS configuration');
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'GREEN': return '#10B981';
      case 'YELLOW': return '#F59E0B';
      case 'RED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getHealthLabel = (status: string) => {
    switch (status) {
      case 'GREEN': return 'Excellent';
      case 'YELLOW': return 'Warning';
      case 'RED': return 'Critical';
      default: return 'Unknown';
    }
  };

  const columns = [
    { id: 'senderEmail', label: 'Sender Email', minWidth: 200 },
    { id: 'domain', label: 'Domain', minWidth: 150, format: (v: any) => v || '-' },
    {
      id: 'domainHealthStatus',
      label: 'Health',
      minWidth: 120,
      format: (value: string) => (
        <Chip
          label={getHealthLabel(value)}
          size="small"
          sx={{
            backgroundColor: getHealthColor(value),
            color: 'white',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: 'reputationScore',
      label: 'Reputation',
      minWidth: 120,
      format: (value: number) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight={600}>
            {value?.toFixed(0) || 100}/100
          </Typography>
          <LinearProgress
            variant="determinate"
            value={value || 100}
            sx={{
              width: 60,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(168, 85, 247, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444',
              },
            }}
          />
        </Box>
      ),
    },
    {
      id: 'dns',
      label: 'DNS Config',
      minWidth: 120,
      format: (_: any, row: any) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title={row.spfConfigured ? 'SPF Configured' : 'SPF Not Configured'}>
            <Chip
              label="SPF"
              size="small"
              color={row.spfConfigured ? 'success' : 'default'}
              sx={{ fontSize: '10px', height: 20 }}
            />
          </Tooltip>
          <Tooltip title={row.dkimConfigured ? 'DKIM Configured' : 'DKIM Not Configured'}>
            <Chip
              label="DKIM"
              size="small"
              color={row.dkimConfigured ? 'success' : 'default'}
              sx={{ fontSize: '10px', height: 20 }}
            />
          </Tooltip>
          <Tooltip title={row.dmarcConfigured ? 'DMARC Configured' : 'DMARC Not Configured'}>
            <Chip
              label="DMARC"
              size="small"
              color={row.dmarcConfigured ? 'success' : 'default'}
              sx={{ fontSize: '10px', height: 20 }}
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 100,
      format: (value: boolean) => <Chip label={value ? 'Active' : 'Inactive'} color={value ? 'success' : 'default'} size="small" />,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 180,
      format: (_: any, row: any) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="View Health">
            <IconButton size="small" onClick={() => handleViewHealth(row)} sx={{ color: '#10B981' }}>
              <HealthAndSafety fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="DNS Setup">
            <IconButton size="small" onClick={() => handleViewDns(row)} sx={{ color: '#3B82F6' }}>
              <Dns fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => handleEdit(row)} sx={{ color: '#A855F7' }}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#EF4444' }}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Email Configurations
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
            New Config
          </Button>
        </Box>

        <DataTable columns={columns} data={configs} loading={loading} />

        {/* Create/Edit Modal */}
        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingConfig(null);
          }}
          title={editingConfig ? 'Edit Email Config' : 'Create New Email Config'}
          maxWidth="sm"
        >
          <Formik
            initialValues={{
              smtpHost: editingConfig?.smtpHost || '',
              smtpPort: editingConfig?.smtpPort || 587,
              senderEmail: editingConfig?.senderEmail || '',
              senderPassword: '',
              senderName: editingConfig?.senderName || '',
              useTls: editingConfig?.useTls ?? true,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
            context={{ isEdit: !!editingConfig }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3}>
                  <TextField name="smtpHost" label="SMTP Host" placeholder="e.g., smtp.gmail.com" />
                  <TextField name="smtpPort" label="SMTP Port" type="number" />
                  <TextField name="senderEmail" label="Sender Email" type="email" />
                  <TextField
                    name="senderPassword"
                    label={editingConfig ? 'Password (leave empty to keep current)' : 'Password'}
                    type="password"
                    placeholder="For Gmail, use App Password"
                  />
                  <TextField name="senderName" label="Sender Name (optional)" />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.useTls}
                        onChange={(e) => setFieldValue('useTls', e.target.checked)}
                      />
                    }
                    label="Use TLS/SSL"
                  />
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button onClick={() => { setShowModal(false); setEditingConfig(null); }}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      {editingConfig ? 'Update' : 'Create'}
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Modal>

        {/* Domain Health Modal */}
        <Dialog open={showHealthModal} onClose={() => setShowHealthModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <HealthAndSafety sx={{ color: '#10B981' }} />
              <Typography variant="h6">Domain Health Report</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {loadingHealth ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Typography>Loading health data...</Typography>
              </Box>
            ) : domainHealth ? (
              <Box display="flex" flexDirection="column" gap={3} mt={2}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Domain</Typography>
                  <Typography variant="h6">{domainHealth.domain}</Typography>
                </Box>

                <Box display="flex" gap={3}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="textSecondary">Health Status</Typography>
                    <Chip
                      label={getHealthLabel(domainHealth.healthStatus)}
                      sx={{
                        backgroundColor: getHealthColor(domainHealth.healthStatus),
                        color: 'white',
                        fontWeight: 600,
                        mt: 1,
                      }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="textSecondary">Reputation Score</Typography>
                    <Typography variant="h4" fontWeight={700} color="primary" mt={1}>
                      {domainHealth.reputationScore?.toFixed(1)}/100
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <Box flex={1} p={2} sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Delivery Rate</Typography>
                    <Typography variant="h6" color="#10B981">{domainHealth.deliveryRate?.toFixed(1)}%</Typography>
                  </Box>
                  <Box flex={1} p={2} sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Bounce Rate</Typography>
                    <Typography variant="h6" color="#EF4444">{domainHealth.bounceRate?.toFixed(1)}%</Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary" mb={1}>Statistics</Typography>
                  <Box display="flex" gap={2}>
                    <Chip label={`${domainHealth.totalEmailsSent} Sent`} />
                    <Chip label={`${domainHealth.successfulDeliveries} Delivered`} color="success" />
                    <Chip label={`${domainHealth.bounces} Bounces`} color="error" />
                    <Chip label={`${domainHealth.spamReports} Spam`} color="warning" />
                  </Box>
                </Box>

                <Box p={2} sx={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Info sx={{ color: '#A855F7' }} />
                    <Typography variant="subtitle2" fontWeight={600}>Recommendation</Typography>
                  </Box>
                  <Typography variant="body2">{domainHealth.recommendation}</Typography>
                </Box>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHealthModal(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* DNS Setup Modal */}
        <Dialog open={showDnsModal} onClose={() => setShowDnsModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Dns sx={{ color: '#3B82F6' }} />
              <Typography variant="h6">DNS Setup Guide</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {dnsGuide ? (
              <Box display="flex" flexDirection="column" gap={3} mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Configure these DNS records for domain: <strong>{dnsGuide.domain}</strong>
                </Typography>

                {/* SPF Records */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h6">SPF Record</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={dnsGuide.spfRecords?.[0]?.configured || false}
                          onChange={(e) => handleUpdateDns('spfConfigured', e.target.checked)}
                        />
                      }
                      label="Configured"
                    />
                  </Box>
                  {dnsGuide.spfRecords?.map((record: any, idx: number) => (
                    <Box key={idx} p={2} sx={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
                      <Typography variant="body2"><strong>Type:</strong> {record.type}</Typography>
                      <Typography variant="body2"><strong>Name:</strong> {record.name}</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        <strong>Value:</strong> {record.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* DKIM Records */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h6">DKIM Record</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={dnsGuide.dkimRecords?.[0]?.configured || false}
                          onChange={(e) => handleUpdateDns('dkimConfigured', e.target.checked)}
                        />
                      }
                      label="Configured"
                    />
                  </Box>
                  {dnsGuide.dkimRecords?.map((record: any, idx: number) => (
                    <Box key={idx} p={2} sx={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
                      <Typography variant="body2"><strong>Type:</strong> {record.type}</Typography>
                      <Typography variant="body2"><strong>Name:</strong> {record.name}</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        <strong>Value:</strong> {record.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* DMARC Records */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h6">DMARC Record</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={dnsGuide.dmarcRecords?.[0]?.configured || false}
                          onChange={(e) => handleUpdateDns('dmarcConfigured', e.target.checked)}
                        />
                      }
                      label="Configured"
                    />
                  </Box>
                  {dnsGuide.dmarcRecords?.map((record: any, idx: number) => (
                    <Box key={idx} p={2} sx={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
                      <Typography variant="body2"><strong>Type:</strong> {record.type}</Typography>
                      <Typography variant="body2"><strong>Name:</strong> {record.name}</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        <strong>Value:</strong> {record.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box p={2} sx={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Setup Instructions</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {dnsGuide.setupInstructions}
                  </Typography>
                </Box>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDnsModal(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default EmailConfigs;
import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, LinearProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Edit, Delete, HealthAndSafety, Dns, Info } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { emailConfigApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';
import { FormControlLabel, Checkbox } from '@mui/material';

const validationSchema = Yup.object({
  smtpHost: Yup.string().required('SMTP Host is required'),
  smtpPort: Yup.number().required('SMTP Port is required'),
  senderEmail: Yup.string().email('Invalid email').required('Sender email is required'),
  senderPassword: Yup.string().when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Password is required'),
  }),
});

const EmailConfigs = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showDnsModal, setShowDnsModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [domainHealth, setDomainHealth] = useState<any>(null);
  const [dnsGuide, setDnsGuide] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await emailConfigApi.getAllConfigs();
      setConfigs(response.data);
    } catch (error) {
      toast.error('Failed to fetch configs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (editingConfig) {
        await emailConfigApi.updateConfig(editingConfig.id, values);
        toast.success('Config updated successfully!');
      } else {
        await emailConfigApi.createConfig(values);
        toast.success('Config created successfully!');
      }
      setShowModal(false);
      setEditingConfig(null);
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to save config');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this config?')) {
      try {
        await emailConfigApi.deleteConfig(id);
        toast.success('Config deleted successfully!');
        fetchConfigs();
      } catch (error) {
        toast.error('Failed to delete config');
      }
    }
  };

  const handleViewHealth = async (config: any) => {
    setSelectedConfig(config);
    setLoadingHealth(true);
    setShowHealthModal(true);
    try {
      const response = await emailConfigApi.getDomainHealth(config.id);
      setDomainHealth(response.data);
    } catch (error) {
      toast.error('Failed to fetch domain health');
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleViewDns = async (config: any) => {
    setSelectedConfig(config);
    setShowDnsModal(true);
    try {
      const response = await emailConfigApi.getDnsSetupGuide(config.id);
      setDnsGuide(response.data);
    } catch (error) {
      toast.error('Failed to fetch DNS guide');
    }
  };

  const handleUpdateDns = async (field: string, value: boolean) => {
    if (!selectedConfig) return;
    try {
      await emailConfigApi.updateDnsConfiguration(selectedConfig.id, {
        [field]: value,
      });
      toast.success('DNS configuration updated!');
      // Refresh DNS guide
      const response = await emailConfigApi.getDnsSetupGuide(selectedConfig.id);
      setDnsGuide(response.data);
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to update DNS configuration');
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'GREEN': return '#10B981';
      case 'YELLOW': return '#F59E0B';
      case 'RED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getHealthLabel = (status: string) => {
    switch (status) {
      case 'GREEN': return 'Excellent';
      case 'YELLOW': return 'Warning';
      case 'RED': return 'Critical';
      default: return 'Unknown';
    }
  };

  const columns = [
    { id: 'senderEmail', label: 'Sender Email', minWidth: 200 },
    { id: 'domain', label: 'Domain', minWidth: 150, format: (v: any) => v || '-' },
    {
      id: 'domainHealthStatus',
      label: 'Health',
      minWidth: 120,
      format: (value: string) => (
        <Chip
          label={getHealthLabel(value)}
          size="small"
          sx={{
            backgroundColor: getHealthColor(value),
            color: 'white',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: 'reputationScore',
      label: 'Reputation',
      minWidth: 120,
      format: (value: number) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight={600}>
            {value?.toFixed(0) || 100}/100
          </Typography>
          <LinearProgress
            variant="determinate"
            value={value || 100}
            sx={{
              width: 60,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(168, 85, 247, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444',
              },
            }}
          />
        </Box>
      ),
    },
    {
      id: 'dns',
      label: 'DNS Config',
      minWidth: 120,
      format: (_: any, row: any) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title={row.spfConfigured ? 'SPF Configured' : 'SPF Not Configured'}>
            <Chip
              label="SPF"
              size="small"
              color={row.spfConfigured ? 'success' : 'default'}
              sx={{ fontSize: '10px', height: 20 }}
            />
          </Tooltip>
          <Tooltip title={row.dkimConfigured ? 'DKIM Configured' : 'DKIM Not Configured'}>
            <Chip
              label="DKIM"
              size="small"
              color={row.dkimConfigured ? 'success' : 'default'}
              sx={{ fontSize: '10px', height: 20 }}
            />
          </Tooltip>
          <Tooltip title={row.dmarcConfigured ? 'DMARC Configured' : 'DMARC Not Configured'}>
            <Chip
              label="DMARC"
              size="small"
              color={row.dmarcConfigured ? 'success' : 'default'}
              sx={{ fontSize: '10px', height: 20 }}
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 100,
      format: (value: boolean) => <Chip label={value ? 'Active' : 'Inactive'} color={value ? 'success' : 'default'} size="small" />,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 180,
      format: (_: any, row: any) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="View Health">
            <IconButton size="small" onClick={() => handleViewHealth(row)} sx={{ color: '#10B981' }}>
              <HealthAndSafety fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="DNS Setup">
            <IconButton size="small" onClick={() => handleViewDns(row)} sx={{ color: '#3B82F6' }}>
              <Dns fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => handleEdit(row)} sx={{ color: '#A855F7' }}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#EF4444' }}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Email Configurations
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
            New Config
          </Button>
        </Box>

        <DataTable columns={columns} data={configs} loading={loading} />

        {/* Create/Edit Modal */}
        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingConfig(null);
          }}
          title={editingConfig ? 'Edit Email Config' : 'Create New Email Config'}
          maxWidth="sm"
        >
          <Formik
            initialValues={{
              smtpHost: editingConfig?.smtpHost || '',
              smtpPort: editingConfig?.smtpPort || 587,
              senderEmail: editingConfig?.senderEmail || '',
              senderPassword: '',
              senderName: editingConfig?.senderName || '',
              useTls: editingConfig?.useTls ?? true,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
            context={{ isEdit: !!editingConfig }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3}>
                  <TextField name="smtpHost" label="SMTP Host" placeholder="e.g., smtp.gmail.com" />
                  <TextField name="smtpPort" label="SMTP Port" type="number" />
                  <TextField name="senderEmail" label="Sender Email" type="email" />
                  <TextField
                    name="senderPassword"
                    label={editingConfig ? 'Password (leave empty to keep current)' : 'Password'}
                    type="password"
                    placeholder="For Gmail, use App Password"
                  />
                  <TextField name="senderName" label="Sender Name (optional)" />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.useTls}
                        onChange={(e) => setFieldValue('useTls', e.target.checked)}
                      />
                    }
                    label="Use TLS/SSL"
                  />
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button onClick={() => { setShowModal(false); setEditingConfig(null); }}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      {editingConfig ? 'Update' : 'Create'}
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Modal>

        {/* Domain Health Modal */}
        <Dialog open={showHealthModal} onClose={() => setShowHealthModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <HealthAndSafety sx={{ color: '#10B981' }} />
              <Typography variant="h6">Domain Health Report</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {loadingHealth ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Typography>Loading health data...</Typography>
              </Box>
            ) : domainHealth ? (
              <Box display="flex" flexDirection="column" gap={3} mt={2}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Domain</Typography>
                  <Typography variant="h6">{domainHealth.domain}</Typography>
                </Box>

                <Box display="flex" gap={3}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="textSecondary">Health Status</Typography>
                    <Chip
                      label={getHealthLabel(domainHealth.healthStatus)}
                      sx={{
                        backgroundColor: getHealthColor(domainHealth.healthStatus),
                        color: 'white',
                        fontWeight: 600,
                        mt: 1,
                      }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="textSecondary">Reputation Score</Typography>
                    <Typography variant="h4" fontWeight={700} color="primary" mt={1}>
                      {domainHealth.reputationScore?.toFixed(1)}/100
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <Box flex={1} p={2} sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Delivery Rate</Typography>
                    <Typography variant="h6" color="#10B981">{domainHealth.deliveryRate?.toFixed(1)}%</Typography>
                  </Box>
                  <Box flex={1} p={2} sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Bounce Rate</Typography>
                    <Typography variant="h6" color="#EF4444">{domainHealth.bounceRate?.toFixed(1)}%</Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary" mb={1}>Statistics</Typography>
                  <Box display="flex" gap={2}>
                    <Chip label={`${domainHealth.totalEmailsSent} Sent`} />
                    <Chip label={`${domainHealth.successfulDeliveries} Delivered`} color="success" />
                    <Chip label={`${domainHealth.bounces} Bounces`} color="error" />
                    <Chip label={`${domainHealth.spamReports} Spam`} color="warning" />
                  </Box>
                </Box>

                <Box p={2} sx={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Info sx={{ color: '#A855F7' }} />
                    <Typography variant="subtitle2" fontWeight={600}>Recommendation</Typography>
                  </Box>
                  <Typography variant="body2">{domainHealth.recommendation}</Typography>
                </Box>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHealthModal(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* DNS Setup Modal */}
        <Dialog open={showDnsModal} onClose={() => setShowDnsModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Dns sx={{ color: '#3B82F6' }} />
              <Typography variant="h6">DNS Setup Guide</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {dnsGuide ? (
              <Box display="flex" flexDirection="column" gap={3} mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Configure these DNS records for domain: <strong>{dnsGuide.domain}</strong>
                </Typography>

                {/* SPF Records */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h6">SPF Record</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={dnsGuide.spfRecords?.[0]?.configured || false}
                          onChange={(e) => handleUpdateDns('spfConfigured', e.target.checked)}
                        />
                      }
                      label="Configured"
                    />
                  </Box>
                  {dnsGuide.spfRecords?.map((record: any, idx: number) => (
                    <Box key={idx} p={2} sx={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
                      <Typography variant="body2"><strong>Type:</strong> {record.type}</Typography>
                      <Typography variant="body2"><strong>Name:</strong> {record.name}</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        <strong>Value:</strong> {record.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* DKIM Records */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h6">DKIM Record</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={dnsGuide.dkimRecords?.[0]?.configured || false}
                          onChange={(e) => handleUpdateDns('dkimConfigured', e.target.checked)}
                        />
                      }
                      label="Configured"
                    />
                  </Box>
                  {dnsGuide.dkimRecords?.map((record: any, idx: number) => (
                    <Box key={idx} p={2} sx={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
                      <Typography variant="body2"><strong>Type:</strong> {record.type}</Typography>
                      <Typography variant="body2"><strong>Name:</strong> {record.name}</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        <strong>Value:</strong> {record.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* DMARC Records */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h6">DMARC Record</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={dnsGuide.dmarcRecords?.[0]?.configured || false}
                          onChange={(e) => handleUpdateDns('dmarcConfigured', e.target.checked)}
                        />
                      }
                      label="Configured"
                    />
                  </Box>
                  {dnsGuide.dmarcRecords?.map((record: any, idx: number) => (
                    <Box key={idx} p={2} sx={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
                      <Typography variant="body2"><strong>Type:</strong> {record.type}</Typography>
                      <Typography variant="body2"><strong>Name:</strong> {record.name}</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        <strong>Value:</strong> {record.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box p={2} sx={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Setup Instructions</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {dnsGuide.setupInstructions}
                  </Typography>
                </Box>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDnsModal(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default EmailConfigs;
