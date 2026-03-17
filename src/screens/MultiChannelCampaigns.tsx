import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add,
  PlayArrow,
  Pause,
  Stop,
  BarChart,
  Email,
  Sms,
  Notifications,
  WhatsApp,
} from '@mui/icons-material';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';
import { multiChannelApi } from '../api/endpoints';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const validationSchema = Yup.object({
  name: Yup.string().required('Campaign name is required'),
  description: Yup.string(),
  scheduledTime: Yup.string(),
  targetAudience: Yup.string(),
  messages: Yup.array().of(
    Yup.object({
      channelType: Yup.string().required('Channel type is required'),
      recipients: Yup.string().required('Recipients are required'),
      subject: Yup.string(),
      content: Yup.string().required('Content is required'),
    })
  ),
});

const MultiChannelCampaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await multiChannelApi.getAllCampaigns();
      setCampaigns(response.data);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (values: any) => {
    try {
      const payload = {
        ...values,
        messages: values.messages.map((msg: any) => ({
          ...msg,
          recipients: msg.recipients.split(',').map((r: string) => r.trim()),
        })),
      };
      await multiChannelApi.createCampaign(payload);
      toast.success('Campaign created successfully');
      setShowModal(false);
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleLaunchCampaign = async (id: number) => {
    try {
      await multiChannelApi.launchCampaign(id);
      toast.success('Campaign launched successfully');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to launch campaign');
    }
  };

  const handlePauseCampaign = async (id: number) => {
    try {
      await multiChannelApi.pauseCampaign(id);
      toast.success('Campaign paused');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to pause campaign');
    }
  };

  const handleCancelCampaign = async (id: number) => {
    try {
      await multiChannelApi.cancelCampaign(id);
      toast.success('Campaign cancelled');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to cancel campaign');
    }
  };

  const handleViewStats = async (campaign: any) => {
    try {
      const response = await multiChannelApi.getCampaignStats(campaign.id);
      setCampaignStats(response.data);
      setSelectedCampaign(campaign);
      setShowStatsModal(true);
    } catch (error) {
      toast.error('Failed to fetch stats');
    }
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'EMAIL':
        return <Email />;
      case 'WHATSAPP':
        return <WhatsApp />;
      case 'SMS':
        return <Sms />;
      case 'PUSH_NOTIFICATION':
        return <Notifications />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'SCHEDULED':
        return 'info';
      case 'RUNNING':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'PAUSED':
        return 'secondary';
      case 'CANCELLED':
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 70 },
    { id: 'name', label: 'Campaign Name', minWidth: 200 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: any) => (
        <Chip label={value} color={getStatusColor(value) as any} size="small" />
      ),
    },
    {
      id: 'channels',
      label: 'Channels',
      minWidth: 150,
      format: (_: any, row: any) => {
        const channels = [...new Set(row.messages?.map((m: any) => m.channelType) || [])] as string[];
        return (
          <Stack direction="row" spacing={0.5}>
            {channels.map((channel) => {
              const icon = getChannelIcon(channel);
              return icon ? (
                <Tooltip key={channel} title={channel}>
                  {icon}
                </Tooltip>
              ) : null;
            })}
          </Stack>
        );
      },
    },
    { id: 'totalRecipients', label: 'Recipients', minWidth: 100 },
    {
      id: 'scheduledTime',
      label: 'Scheduled',
      minWidth: 180,
      format: (value: any) =>
        value ? new Date(value).toLocaleString() : '-',
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 200,
      format: (_: any, row: any) => (
        <Box>
          {row.status === 'DRAFT' && (
            <Tooltip title="Launch">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleLaunchCampaign(row.id)}
              >
                <PlayArrow />
              </IconButton>
            </Tooltip>
          )}
          {row.status === 'RUNNING' && (
            <Tooltip title="Pause">
              <IconButton
                size="small"
                color="warning"
                onClick={() => handlePauseCampaign(row.id)}
              >
                <Pause />
              </IconButton>
            </Tooltip>
          )}
          {(row.status === 'RUNNING' || row.status === 'PAUSED') && (
            <Tooltip title="Cancel">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleCancelCampaign(row.id)}
              >
                <Stop />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View Stats">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleViewStats(row)}
            >
              <BarChart />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const initialValues = {
    name: '',
    description: '',
    scheduledTime: '',
    targetAudience: '',
    messages: [
      {
        channelType: 'EMAIL',
        recipients: '',
        subject: '',
        content: '',
        templateId: null,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Multi-Channel Campaigns</Typography>
        <Button
          startIcon={<Add />}
          onClick={() => setShowModal(true)}
        >
          Create Campaign
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={campaigns}
        loading={loading}
      />

      {/* Create Campaign Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create Multi-Channel Campaign"
        maxWidth="md"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleCreateCampaign}
        >
          {({ values }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Campaign Name"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="scheduledTime"
                    label="Scheduled Time"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="targetAudience"
                    label="Target Audience"
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Messages
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FieldArray name="messages">
                    {({ push, remove }) => (
                      <>
                        {values.messages.map((message: any, index: number) => (
                          <Card key={index} sx={{ mb: 2, p: 2 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  name={`messages.${index}.channelType`}
                                  label="Channel Type"
                                  select
                                  fullWidth
                                  SelectProps={{ native: true }}
                                >
                                  <option value="EMAIL">Email</option>
                                  <option value="WHATSAPP">WhatsApp</option>
                                  <option value="SMS">SMS</option>
                                  <option value="PUSH_NOTIFICATION">Push Notification</option>
                                </TextField>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  name={`messages.${index}.recipients`}
                                  label="Recipients (comma-separated)"
                                  fullWidth
                                  placeholder="user@example.com, +923001234567"
                                />
                              </Grid>
                              {message.channelType === 'EMAIL' && (
                                <Grid item xs={12}>
                                  <TextField
                                    name={`messages.${index}.subject`}
                                    label="Subject"
                                    fullWidth
                                  />
                                </Grid>
                              )}
                              <Grid item xs={12}>
                                <TextField
                                  name={`messages.${index}.content`}
                                  label="Content"
                                  fullWidth
                                  multiline
                                  rows={3}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Button
                                  color="error"
                                  size="small"
                                  onClick={() => remove(index)}
                                  disabled={values.messages.length === 1}
                                >
                                  Remove Message
                                </Button>
                              </Grid>
                            </Grid>
                          </Card>
                        ))}
                        <Button
                          startIcon={<Add />}
                          onClick={() =>
                            push({
                              channelType: 'EMAIL',
                              recipients: '',
                              subject: '',
                              content: '',
                              templateId: null,
                            })
                          }
                        >
                          Add Message
                        </Button>
                      </>
                    )}
                  </FieldArray>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="outlined" onClick={() => setShowModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained">
                      Create Campaign
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Modal>


      {/* Campaign Stats Modal */}
      <Dialog
        open={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Campaign Statistics: {selectedCampaign?.name}
        </DialogTitle>
        <DialogContent>
          {campaignStats && (
            <Box>
              <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)}>
                <Tab label="Overview" />
                <Tab label="Channel Breakdown" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Messages
                        </Typography>
                        <Typography variant="h4">
                          {campaignStats.totalMessages}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Sent
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {campaignStats.sentMessages}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Delivered
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {campaignStats.deliveredMessages}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Opened
                        </Typography>
                        <Typography variant="h4" color="info.main">
                          {campaignStats.openedMessages}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Clicked
                        </Typography>
                        <Typography variant="h4" color="warning.main">
                          {campaignStats.clickedMessages}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Failed
                        </Typography>
                        <Typography variant="h4" color="error.main">
                          {campaignStats.failedMessages}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Performance Metrics
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Delivery Rate</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {campaignStats.deliveryRate.toFixed(2)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={campaignStats.deliveryRate}
                              color="success"
                            />
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Open Rate</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {campaignStats.openRate.toFixed(2)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={campaignStats.openRate}
                              color="info"
                            />
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Click Rate</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {campaignStats.clickRate.toFixed(2)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={campaignStats.clickRate}
                              color="warning"
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  {Object.entries(campaignStats.channelStats || {}).map(
                    ([channel, stats]: [string, any]) => (
                      <Grid item xs={12} sm={6} key={channel}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              {getChannelIcon(channel)}
                              <Typography variant="h6" sx={{ ml: 1 }}>
                                {channel}
                              </Typography>
                            </Box>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Total
                                </Typography>
                                <Typography variant="h6">{stats.total}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Sent
                                </Typography>
                                <Typography variant="h6">{stats.sent}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Delivered
                                </Typography>
                                <Typography variant="h6">{stats.delivered}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Opened
                                </Typography>
                                <Typography variant="h6">{stats.opened}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Clicked
                                </Typography>
                                <Typography variant="h6">{stats.clicked}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Failed
                                </Typography>
                                <Typography variant="h6" color="error">
                                  {stats.failed}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  )}
                </Grid>
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiChannelCampaigns;
