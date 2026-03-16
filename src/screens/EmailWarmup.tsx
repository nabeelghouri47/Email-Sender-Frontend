import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, LinearProgress, Dialog, DialogTitle, DialogContent, Alert } from '@mui/material';
import { Add, Pause, PlayArrow, Stop, TrendingUp } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { warmupApi, emailConfigApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Card } from '../components/common/Card';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const validationSchema = Yup.object({
  configId: Yup.number().required('Email config is required'),
  targetDailyLimit: Yup.number().min(10, 'Must be at least 10').required('Target limit is required'),
  incrementPerDay: Yup.number().min(1, 'Must be at least 1').required('Increment is required'),
});

const EmailWarmup = () => {
  const [warmups, setWarmups] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [warmupsRes, configsRes] = await Promise.all([
        warmupApi.getActiveWarmups(),
        emailConfigApi.getAllConfigs(),
      ]);
      setWarmups(warmupsRes.data);
      setConfigs(configsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      await warmupApi.startWarmup(values);
      toast.success('Warmup started!');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to start warmup');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePause = async (id: number) => {
    try {
      await warmupApi.pauseWarmup(id);
      toast.success('Warmup paused!');
      fetchData();
    } catch (error) {
      toast.error('Failed to pause warmup');
    }
  };

  const handleResume = async (id: number) => {
    try {
      await warmupApi.resumeWarmup(id);
      toast.success('Warmup resumed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to resume warmup');
    }
  };

  const handleStop = async (id: number) => {
    if (window.confirm('Stop this warmup?')) {
      try {
        await warmupApi.stopWarmup(id);
        toast.success('Warmup stopped!');
        fetchData();
      } catch (error) {
        toast.error('Failed to stop warmup');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PAUSED': return 'warning';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Email Warmup
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Gradually increase sending volume to build sender reputation
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
          Start Warmup
        </Button>
      </Box>

      {warmups.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No active warmups. Start a warmup to gradually increase your sending volume and protect your sender reputation.
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={3}>
        {warmups.map((warmup) => (
          <Card key={warmup.id}>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    {warmup.emailConfig?.senderEmail || 'Unknown'}
                  </Typography>
                  <Chip
                    label={warmup.status}
                    color={getStatusColor(warmup.status) as any}
                    size="small"
                  />
                </Box>

                <Box display="flex" gap={4} mb={3}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Current Limit
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary">
                      {warmup.currentDailyLimit}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Target Limit
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {warmup.targetDailyLimit}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Increment/Day
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      +{warmup.incrementPerDay}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Days Active
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {warmup.warmupDays}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {calculateProgress(warmup.currentDailyLimit, warmup.targetDailyLimit).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(warmup.currentDailyLimit, warmup.targetDailyLimit)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#A855F7',
                      },
                    }}
                  />
                </Box>

                <Typography variant="body2" color="textSecondary">
                  Today: {warmup.emailsSentToday} / {warmup.currentDailyLimit} emails sent
                </Typography>
              </Box>

              <Box display="flex" gap={1}>
                {warmup.status === 'ACTIVE' && (
                  <>
                    <IconButton size="small" onClick={() => handlePause(warmup.id)} sx={{ color: '#F59E0B' }}>
                      <Pause />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleStop(warmup.id)} sx={{ color: '#EF4444' }}>
                      <Stop />
                    </IconButton>
                  </>
                )}
                {warmup.status === 'PAUSED' && (
                  <>
                    <IconButton size="small" onClick={() => handleResume(warmup.id)} sx={{ color: '#10B981' }}>
                      <PlayArrow />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleStop(warmup.id)} sx={{ color: '#EF4444' }}>
                      <Stop />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUp sx={{ color: '#10B981' }} />
            <Typography variant="h6">Start Email Warmup</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Warmup gradually increases your daily sending limit to build sender reputation and avoid spam filters.
          </Alert>
          <Formik
            initialValues={{
              configId: '',
              targetDailyLimit: 500,
              incrementPerDay: 10,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3}>
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

                  <TextField
                    name="targetDailyLimit"
                    label="Target Daily Limit"
                    type="number"
                    helperText="Maximum emails per day you want to reach"
                  />

                  <TextField
                    name="incrementPerDay"
                    label="Increment Per Day"
                    type="number"
                    helperText="How many emails to add each day"
                  />

                  <Alert severity="success">
                    <Typography variant="body2">
                      <strong>Estimated Duration:</strong>{' '}
                      {Math.ceil((values.targetDailyLimit - 10) / values.incrementPerDay)} days
                    </Typography>
                    <Typography variant="caption" display="block" mt={1}>
                      Starting at 10 emails/day, increasing by {values.incrementPerDay} daily until {values.targetDailyLimit}
                    </Typography>
                  </Alert>

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      Start Warmup
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

export default EmailWarmup;
import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, LinearProgress, Dialog, DialogTitle, DialogContent, Alert } from '@mui/material';
import { Add, Pause, PlayArrow, Stop, TrendingUp } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { warmupApi, emailConfigApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Card } from '../components/common/Card';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const validationSchema = Yup.object({
  configId: Yup.number().required('Email config is required'),
  targetDailyLimit: Yup.number().min(10, 'Must be at least 10').required('Target limit is required'),
  incrementPerDay: Yup.number().min(1, 'Must be at least 1').required('Increment is required'),
});

const EmailWarmup = () => {
  const [warmups, setWarmups] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [warmupsRes, configsRes] = await Promise.all([
        warmupApi.getActiveWarmups(),
        emailConfigApi.getAllConfigs(),
      ]);
      setWarmups(warmupsRes.data);
      setConfigs(configsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      await warmupApi.startWarmup(values);
      toast.success('Warmup started!');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to start warmup');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePause = async (id: number) => {
    try {
      await warmupApi.pauseWarmup(id);
      toast.success('Warmup paused!');
      fetchData();
    } catch (error) {
      toast.error('Failed to pause warmup');
    }
  };

  const handleResume = async (id: number) => {
    try {
      await warmupApi.resumeWarmup(id);
      toast.success('Warmup resumed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to resume warmup');
    }
  };

  const handleStop = async (id: number) => {
    if (window.confirm('Stop this warmup?')) {
      try {
        await warmupApi.stopWarmup(id);
        toast.success('Warmup stopped!');
        fetchData();
      } catch (error) {
        toast.error('Failed to stop warmup');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PAUSED': return 'warning';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Email Warmup
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Gradually increase sending volume to build sender reputation
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
          Start Warmup
        </Button>
      </Box>

      {warmups.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No active warmups. Start a warmup to gradually increase your sending volume and protect your sender reputation.
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={3}>
        {warmups.map((warmup) => (
          <Card key={warmup.id}>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    {warmup.emailConfig?.senderEmail || 'Unknown'}
                  </Typography>
                  <Chip
                    label={warmup.status}
                    color={getStatusColor(warmup.status) as any}
                    size="small"
                  />
                </Box>

                <Box display="flex" gap={4} mb={3}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Current Limit
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary">
                      {warmup.currentDailyLimit}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Target Limit
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {warmup.targetDailyLimit}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Increment/Day
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      +{warmup.incrementPerDay}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Days Active
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {warmup.warmupDays}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {calculateProgress(warmup.currentDailyLimit, warmup.targetDailyLimit).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(warmup.currentDailyLimit, warmup.targetDailyLimit)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#A855F7',
                      },
                    }}
                  />
                </Box>

                <Typography variant="body2" color="textSecondary">
                  Today: {warmup.emailsSentToday} / {warmup.currentDailyLimit} emails sent
                </Typography>
              </Box>

              <Box display="flex" gap={1}>
                {warmup.status === 'ACTIVE' && (
                  <>
                    <IconButton size="small" onClick={() => handlePause(warmup.id)} sx={{ color: '#F59E0B' }}>
                      <Pause />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleStop(warmup.id)} sx={{ color: '#EF4444' }}>
                      <Stop />
                    </IconButton>
                  </>
                )}
                {warmup.status === 'PAUSED' && (
                  <>
                    <IconButton size="small" onClick={() => handleResume(warmup.id)} sx={{ color: '#10B981' }}>
                      <PlayArrow />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleStop(warmup.id)} sx={{ color: '#EF4444' }}>
                      <Stop />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUp sx={{ color: '#10B981' }} />
            <Typography variant="h6">Start Email Warmup</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Warmup gradually increases your daily sending limit to build sender reputation and avoid spam filters.
          </Alert>
          <Formik
            initialValues={{
              configId: '',
              targetDailyLimit: 500,
              incrementPerDay: 10,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3}>
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

                  <TextField
                    name="targetDailyLimit"
                    label="Target Daily Limit"
                    type="number"
                    helperText="Maximum emails per day you want to reach"
                  />

                  <TextField
                    name="incrementPerDay"
                    label="Increment Per Day"
                    type="number"
                    helperText="How many emails to add each day"
                  />

                  <Alert severity="success">
                    <Typography variant="body2">
                      <strong>Estimated Duration:</strong>{' '}
                      {Math.ceil((values.targetDailyLimit - 10) / values.incrementPerDay)} days
                    </Typography>
                    <Typography variant="caption" display="block" mt={1}>
                      Starting at 10 emails/day, increasing by {values.incrementPerDay} daily until {values.targetDailyLimit}
                    </Typography>
                  </Alert>

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      Start Warmup
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

export default EmailWarmup;
