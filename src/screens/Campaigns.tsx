<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { Add, Upload, PlayArrow, Pause, Stop, Schedule, Edit, Delete, Send } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { campaignApi, templateApi, emailConfigApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';
import { Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';

const validationSchema = Yup.object({
  name: Yup.string().required('Campaign name is required'),
  templateId: Yup.number().required('Template is required'),
  configId: Yup.number().required('Email config is required'),
  dailyLimit: Yup.number().min(1, 'Must be at least 1').required('Daily limit is required'),
});

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignsRes, templatesRes, configsRes] = await Promise.all([
        campaignApi.getAllCampaigns(),
        templateApi.getAllTemplates(),
        emailConfigApi.getAllConfigs(),
      ]);
      setCampaigns(campaignsRes.data);
      setTemplates(templatesRes.data);
      setConfigs(configsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (editingCampaign) {
        await campaignApi.updateCampaign(editingCampaign.id, values);
        toast.success('Campaign updated!');
      } else {
        await campaignApi.createCampaign(values);
        toast.success('Campaign created!');
      }
      setShowModal(false);
      setEditingCampaign(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedCampaign) return;
    try {
      await campaignApi.uploadClients(selectedCampaign.id, uploadFile);
      toast.success('Clients uploaded!');
      setShowUploadModal(false);
      setUploadFile(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to upload clients');
    }
  };

  const handleSchedule = async (values: any) => {
    if (!selectedCampaign) return;
    try {
      await campaignApi.scheduleCampaign(selectedCampaign.id, {
        scheduledStartDate: values.scheduledStartDate,
        timezone: values.timezone,
      });
      toast.success('Campaign scheduled!');
      setShowScheduleModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to schedule campaign');
    }
  };

  const handlePause = async (id: number) => {
    try {
      await campaignApi.pauseCampaign(id);
      toast.success('Campaign paused!');
      fetchData();
    } catch (error) {
      toast.error('Failed to pause campaign');
    }
  };

  const handleResume = async (id: number) => {
    try {
      await campaignApi.resumeCampaign(id);
      toast.success('Campaign resumed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to resume campaign');
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Cancel this campaign?')) {
      try {
        await campaignApi.cancelCampaign(id);
        toast.success('Campaign cancelled!');
        fetchData();
      } catch (error) {
        toast.error('Failed to cancel campaign');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this campaign?')) {
      try {
        await campaignApi.deleteCampaign(id);
        toast.success('Campaign deleted!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete campaign');
      }
    }
  };

  const handleSendNow = async (id: number) => {
    if (window.confirm('Send emails now?')) {
      try {
        await campaignApi.sendNow(id);
        toast.success('Emails sent!');
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to send emails');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'success';
      case 'PAUSED': return 'warning';
      case 'SCHEDULED': return 'info';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { id: 'name', label: 'Campaign Name', minWidth: 200 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => (
        <Chip label={value} color={getStatusColor(value) as any} size="small" />
      ),
    },
    {
      id: 'campaignType',
      label: 'Type',
      minWidth: 100,
      format: (value: string) => <Chip label={value} size="small" variant="outlined" />,
    },
    {
      id: 'progress',
      label: 'Progress',
      minWidth: 150,
      format: (_: any, row: any) => (
        <Typography variant="body2">
          {row.sentCount} / {row.totalClients}
        </Typography>
      ),
    },
    { id: 'dailyLimit', label: 'Daily Limit', minWidth: 100 },
    {
      id: 'scheduledStartDate',
      label: 'Scheduled',
      minWidth: 150,
      format: (value: any) => value ? new Date(value).toLocaleString() : '-',
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 250,
      format: (_: any, row: any) => (
        <Box display="flex" gap={0.5}>
          {row.status === 'DRAFT' && (
            <>
              <Tooltip title="Upload Clients">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedCampaign(row);
                    setShowUploadModal(true);
                  }}
                  sx={{ color: '#3B82F6' }}
                >
                  <Upload fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Schedule">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedCampaign(row);
                    setShowScheduleModal(true);
                  }}
                  sx={{ color: '#8B5CF6' }}
                >
                  <Schedule fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {row.status === 'RUNNING' && (
            <>
              <Tooltip title="Pause">
                <IconButton size="small" onClick={() => handlePause(row.id)} sx={{ color: '#F59E0B' }}>
                  <Pause fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Send Now">
                <IconButton size="small" onClick={() => handleSendNow(row.id)} sx={{ color: '#10B981' }}>
                  <Send fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {row.status === 'PAUSED' && (
            <Tooltip title="Resume">
              <IconButton size="small" onClick={() => handleResume(row.id)} sx={{ color: '#10B981' }}>
                <PlayArrow fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {(row.status === 'RUNNING' || row.status === 'PAUSED' || row.status === 'SCHEDULED') && (
            <Tooltip title="Cancel">
              <IconButton size="small" onClick={() => handleCancel(row.id)} sx={{ color: '#EF4444' }}>
                <Stop fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setEditingCampaign(row);
                setShowModal(true);
              }}
              sx={{ color: '#A855F7' }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#EF4444' }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Campaigns
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
          New Campaign
        </Button>
      </Box>

      <DataTable columns={columns} data={campaigns} loading={loading} />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCampaign(null);
        }}
        title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
        maxWidth="sm"
      >
        <Formik
          initialValues={{
            name: editingCampaign?.name || '',
            templateId: editingCampaign?.template?.id || '',
            configId: editingCampaign?.emailConfig?.id || '',
            dailyLimit: editingCampaign?.dailyLimit || 100,
            autoRestart: editingCampaign?.autoRestart ?? false,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField name="name" label="Campaign Name" />
                
                <FormControl fullWidth>
                  <InputLabel>Template</InputLabel>
                  <Select
                    value={values.templateId}
                    onChange={(e) => setFieldValue('templateId', e.target.value)}
                    label="Template"
                  >
                    {templates.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Email Config</InputLabel>
                  <Select
                    value={values.configId}
                    onChange={(e) => setFieldValue('configId', e.target.value)}
                    label="Email Config"
                  >
                    {configs.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.senderEmail}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField name="dailyLimit" label="Daily Limit" type="number" />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.autoRestart}
                      onChange={(e) => setFieldValue('autoRestart', e.target.checked)}
                    />
                  }
                  label="Auto Restart"
                />

                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button onClick={() => { setShowModal(false); setEditingCampaign(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" loading={isSubmitting}>
                    {editingCampaign ? 'Update' : 'Create'}
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Upload Clients Modal */}
      <Dialog open={showUploadModal} onClose={() => setShowUploadModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Clients</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            {uploadFile && (
              <Typography variant="body2" mt={2}>
                Selected: {uploadFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!uploadFile}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onClose={() => setShowScheduleModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Campaign</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              scheduledStartDate: '',
              timezone: 'UTC',
            }}
            onSubmit={handleSchedule}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3} mt={2}>
                  <TextField
                    name="scheduledStartDate"
                    label="Start Date & Time"
                    type="datetime-local"
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={values.timezone}
                      onChange={(e) => setFieldValue('timezone', e.target.value)}
                      label="Timezone"
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">America/New_York</MenuItem>
                      <MenuItem value="America/Los_Angeles">America/Los_Angeles</MenuItem>
                      <MenuItem value="Europe/London">Europe/London</MenuItem>
                      <MenuItem value="Asia/Tokyo">Asia/Tokyo</MenuItem>
                      <MenuItem value="Asia/Karachi">Asia/Karachi</MenuItem>
                    </Select>
                  </FormControl>

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      Schedule
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

export default Campaigns;
=======
import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { Add, Upload, PlayArrow, Pause, Stop, Schedule, Edit, Delete, Send } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { campaignApi, templateApi, emailConfigApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';
import { Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';

const validationSchema = Yup.object({
  name: Yup.string().required('Campaign name is required'),
  templateId: Yup.number().required('Template is required'),
  configId: Yup.number().required('Email config is required'),
  dailyLimit: Yup.number().min(1, 'Must be at least 1').required('Daily limit is required'),
});

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignsRes, templatesRes, configsRes] = await Promise.all([
        campaignApi.getAllCampaigns(),
        templateApi.getAllTemplates(),
        emailConfigApi.getAllConfigs(),
      ]);
      setCampaigns(campaignsRes.data);
      setTemplates(templatesRes.data);
      setConfigs(configsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (editingCampaign) {
        await campaignApi.updateCampaign(editingCampaign.id, values);
        toast.success('Campaign updated!');
      } else {
        await campaignApi.createCampaign(values);
        toast.success('Campaign created!');
      }
      setShowModal(false);
      setEditingCampaign(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedCampaign) return;
    try {
      await campaignApi.uploadClients(selectedCampaign.id, uploadFile);
      toast.success('Clients uploaded!');
      setShowUploadModal(false);
      setUploadFile(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to upload clients');
    }
  };

  const handleSchedule = async (values: any) => {
    if (!selectedCampaign) return;
    try {
      await campaignApi.scheduleCampaign(selectedCampaign.id, {
        scheduledStartDate: values.scheduledStartDate,
        timezone: values.timezone,
      });
      toast.success('Campaign scheduled!');
      setShowScheduleModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to schedule campaign');
    }
  };

  const handlePause = async (id: number) => {
    try {
      await campaignApi.pauseCampaign(id);
      toast.success('Campaign paused!');
      fetchData();
    } catch (error) {
      toast.error('Failed to pause campaign');
    }
  };

  const handleResume = async (id: number) => {
    try {
      await campaignApi.resumeCampaign(id);
      toast.success('Campaign resumed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to resume campaign');
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Cancel this campaign?')) {
      try {
        await campaignApi.cancelCampaign(id);
        toast.success('Campaign cancelled!');
        fetchData();
      } catch (error) {
        toast.error('Failed to cancel campaign');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this campaign?')) {
      try {
        await campaignApi.deleteCampaign(id);
        toast.success('Campaign deleted!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete campaign');
      }
    }
  };

  const handleSendNow = async (id: number) => {
    if (window.confirm('Send emails now?')) {
      try {
        await campaignApi.sendNow(id);
        toast.success('Emails sent!');
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to send emails');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'success';
      case 'PAUSED': return 'warning';
      case 'SCHEDULED': return 'info';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { id: 'name', label: 'Campaign Name', minWidth: 200 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => (
        <Chip label={value} color={getStatusColor(value) as any} size="small" />
      ),
    },
    {
      id: 'campaignType',
      label: 'Type',
      minWidth: 100,
      format: (value: string) => <Chip label={value} size="small" variant="outlined" />,
    },
    {
      id: 'progress',
      label: 'Progress',
      minWidth: 150,
      format: (_: any, row: any) => (
        <Typography variant="body2">
          {row.sentCount} / {row.totalClients}
        </Typography>
      ),
    },
    { id: 'dailyLimit', label: 'Daily Limit', minWidth: 100 },
    {
      id: 'scheduledStartDate',
      label: 'Scheduled',
      minWidth: 150,
      format: (value: any) => value ? new Date(value).toLocaleString() : '-',
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 250,
      format: (_: any, row: any) => (
        <Box display="flex" gap={0.5}>
          {row.status === 'DRAFT' && (
            <>
              <Tooltip title="Upload Clients">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedCampaign(row);
                    setShowUploadModal(true);
                  }}
                  sx={{ color: '#3B82F6' }}
                >
                  <Upload fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Schedule">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedCampaign(row);
                    setShowScheduleModal(true);
                  }}
                  sx={{ color: '#8B5CF6' }}
                >
                  <Schedule fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {row.status === 'RUNNING' && (
            <>
              <Tooltip title="Pause">
                <IconButton size="small" onClick={() => handlePause(row.id)} sx={{ color: '#F59E0B' }}>
                  <Pause fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Send Now">
                <IconButton size="small" onClick={() => handleSendNow(row.id)} sx={{ color: '#10B981' }}>
                  <Send fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {row.status === 'PAUSED' && (
            <Tooltip title="Resume">
              <IconButton size="small" onClick={() => handleResume(row.id)} sx={{ color: '#10B981' }}>
                <PlayArrow fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {(row.status === 'RUNNING' || row.status === 'PAUSED' || row.status === 'SCHEDULED') && (
            <Tooltip title="Cancel">
              <IconButton size="small" onClick={() => handleCancel(row.id)} sx={{ color: '#EF4444' }}>
                <Stop fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setEditingCampaign(row);
                setShowModal(true);
              }}
              sx={{ color: '#A855F7' }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#EF4444' }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Campaigns
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
          New Campaign
        </Button>
      </Box>

      <DataTable columns={columns} data={campaigns} loading={loading} />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCampaign(null);
        }}
        title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
        maxWidth="sm"
      >
        <Formik
          initialValues={{
            name: editingCampaign?.name || '',
            templateId: editingCampaign?.template?.id || '',
            configId: editingCampaign?.emailConfig?.id || '',
            dailyLimit: editingCampaign?.dailyLimit || 100,
            autoRestart: editingCampaign?.autoRestart ?? false,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField name="name" label="Campaign Name" />
                
                <FormControl fullWidth>
                  <InputLabel>Template</InputLabel>
                  <Select
                    value={values.templateId}
                    onChange={(e) => setFieldValue('templateId', e.target.value)}
                    label="Template"
                  >
                    {templates.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Email Config</InputLabel>
                  <Select
                    value={values.configId}
                    onChange={(e) => setFieldValue('configId', e.target.value)}
                    label="Email Config"
                  >
                    {configs.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.senderEmail}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField name="dailyLimit" label="Daily Limit" type="number" />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.autoRestart}
                      onChange={(e) => setFieldValue('autoRestart', e.target.checked)}
                    />
                  }
                  label="Auto Restart"
                />

                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button onClick={() => { setShowModal(false); setEditingCampaign(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" loading={isSubmitting}>
                    {editingCampaign ? 'Update' : 'Create'}
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Upload Clients Modal */}
      <Dialog open={showUploadModal} onClose={() => setShowUploadModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Clients</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            {uploadFile && (
              <Typography variant="body2" mt={2}>
                Selected: {uploadFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!uploadFile}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onClose={() => setShowScheduleModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Campaign</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              scheduledStartDate: '',
              timezone: 'UTC',
            }}
            onSubmit={handleSchedule}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3} mt={2}>
                  <TextField
                    name="scheduledStartDate"
                    label="Start Date & Time"
                    type="datetime-local"
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={values.timezone}
                      onChange={(e) => setFieldValue('timezone', e.target.value)}
                      label="Timezone"
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">America/New_York</MenuItem>
                      <MenuItem value="America/Los_Angeles">America/Los_Angeles</MenuItem>
                      <MenuItem value="Europe/London">Europe/London</MenuItem>
                      <MenuItem value="Asia/Tokyo">Asia/Tokyo</MenuItem>
                      <MenuItem value="Asia/Karachi">Asia/Karachi</MenuItem>
                    </Select>
                  </FormControl>

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      Schedule
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

export default Campaigns;
>>>>>>> 5e525f2 (Frontend updated)
