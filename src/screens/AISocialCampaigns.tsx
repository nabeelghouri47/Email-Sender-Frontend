import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  PlayArrow,
  Pause,
  Visibility,
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';
import { aiSocialApi, metaConfigApi } from '../api/endpoints';

const validationSchema = Yup.object({
  name: Yup.string().required('Campaign name is required'),
  aiPrompt: Yup.string().required('AI prompt is required'),
  platform: Yup.string().required('Platform is required'),
  metaConfigId: Yup.number().required('Please select a Meta account'),
  durationDays: Yup.number().min(1).required('Duration is required'),
  postsPerDay: Yup.number().min(1).max(10).required('Posts per day is required'),
  postingTime: Yup.string().required('Posting time is required'),
});

const AISocialCampaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPostsModal, setShowPostsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignPosts, setCampaignPosts] = useState<any[]>([]);
  const [metaConfigs, setMetaConfigs] = useState<any[]>([]);

  useEffect(() => {
    fetchCampaigns();
    fetchMetaConfigs();
  }, []);

  const fetchMetaConfigs = async () => {
    try {
      const res = await metaConfigApi.getActive();
      setMetaConfigs(res.data);
    } catch {
      // silent
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await aiSocialApi.getAllCampaigns();
      setCampaigns(response.data);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      await aiSocialApi.createCampaign(values);
      toast.success('Campaign created successfully');
      setShowModal(false);
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleStart = async (id: number) => {
    try {
      await aiSocialApi.startCampaign(id);
      toast.success('Campaign started! AI will generate posts daily.');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to start campaign');
    }
  };

  const handlePause = async (id: number) => {
    try {
      await aiSocialApi.pauseCampaign(id);
      toast.success('Campaign paused');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to pause campaign');
    }
  };

  const handleViewPosts = async (campaign: any) => {
    try {
      const response = await aiSocialApi.getCampaignPosts(campaign.id);
      setCampaignPosts(response.data);
      setSelectedCampaign(campaign);
      setShowPostsModal(true);
    } catch (error) {
      toast.error('Failed to fetch posts');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK':
        return <Facebook sx={{ color: '#1877F2' }} />;
      case 'INSTAGRAM':
        return <Instagram sx={{ color: '#E4405F' }} />;
      case 'TWITTER':
        return <Twitter sx={{ color: '#1DA1F2' }} />;
      case 'LINKEDIN':
        return <LinkedIn sx={{ color: '#0A66C2' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'ACTIVE':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPostStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'warning';
      case 'APPROVED':
        return 'info';
      case 'REVISION_REQUESTED':
        return 'secondary';
      case 'GENERATING_REVISION':
        return 'default';
      case 'POSTED':
        return 'success';
      case 'FAILED':
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 70 },
    { id: 'name', label: 'Campaign Name', minWidth: 200 },
    {
      id: 'platform',
      label: 'Platform',
      minWidth: 120,
      format: (value: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getPlatformIcon(value)}
          <span>{value}</span>
        </Box>
      ),
    },
    {
      id: 'metaConfigName',
      label: 'Meta Account',
      minWidth: 160,
      format: (value: any) => value || <Typography variant="caption" color="textSecondary">—</Typography>,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: any) => (
        <Chip label={value} color={getStatusColor(value) as any} size="small" />
      ),
    },
    { id: 'durationDays', label: 'Duration (Days)', minWidth: 120 },
    { id: 'postsPerDay', label: 'Posts/Day', minWidth: 100 },
    {
      id: 'startDate',
      label: 'Start Date',
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
            <Tooltip title="Start Campaign">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleStart(row.id)}
              >
                <PlayArrow />
              </IconButton>
            </Tooltip>
          )}
          {row.status === 'ACTIVE' && (
            <Tooltip title="Pause Campaign">
              <IconButton
                size="small"
                color="warning"
                onClick={() => handlePause(row.id)}
              >
                <Pause />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View Posts">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleViewPosts(row)}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const postColumns = [
    { id: 'id', label: 'ID', minWidth: 70 },
    {
      id: 'content',
      label: 'Content',
      minWidth: 300,
      format: (value: any) => (
        <Typography
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 150,
      format: (value: any) => (
        <Chip label={value.replace(/_/g, ' ')} color={getPostStatusColor(value) as any} size="small" />
      ),
    },
    {
      id: 'scheduledTime',
      label: 'Scheduled',
      minWidth: 180,
      format: (value: any) =>
        value ? new Date(value).toLocaleString() : '-',
    },
    {
      id: 'postedAt',
      label: 'Posted',
      minWidth: 180,
      format: (value: any) =>
        value ? new Date(value).toLocaleString() : '-',
    },
    { id: 'revisionCount', label: 'Revisions', minWidth: 100 },
  ];

  const initialValues = {
    name: '',
    description: '',
    aiPrompt: '',
    platform: 'FACEBOOK',
    metaConfigId: '',
    durationDays: 7,
    postsPerDay: 1,
    postingTime: '09:00',
    requiresApproval: true,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">AI Social Campaigns</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Create campaigns with AI-generated posts and email approval workflow
          </Typography>
        </Box>
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
        title="Create AI Social Campaign"
        maxWidth="md"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Campaign Name"
                    fullWidth
                    placeholder="Summer Product Launch"
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

                <Grid item xs={12}>
                  <TextField
                    name="aiPrompt"
                    label="AI Prompt"
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Create engaging posts about our new product launch. Focus on benefits, use emojis, and include call-to-action. Target audience is young professionals aged 25-35."
                    helperText="Describe what kind of posts you want AI to generate"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="platform"
                    label="Platform"
                    select
                    fullWidth
                    SelectProps={{ native: true }}
                  >
                    <option value="FACEBOOK">Facebook</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="TWITTER">Twitter</option>
                    <option value="LINKEDIN">LinkedIn</option>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="metaConfigId"
                    label="Meta Account"
                    select
                    fullWidth
                    SelectProps={{ native: true }}
                    helperText={metaConfigs.length === 0 ? 'No Meta accounts configured. Go to Meta Configurations first.' : ''}
                  >
                    <option value="">-- Select Meta Account --</option>
                    {metaConfigs.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} (Page: {c.facebookPageId})</option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    name="durationDays"
                    label="Duration (Days)"
                    type="number"
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    name="postsPerDay"
                    label="Posts Per Day"
                    type="number"
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    name="postingTime"
                    label="Posting Time"
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
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

      {/* Posts Modal */}
      <Dialog
        open={showPostsModal}
        onClose={() => setShowPostsModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Campaign Posts: {selectedCampaign?.name}
        </DialogTitle>
        <DialogContent>
          <DataTable
            columns={postColumns}
            data={campaignPosts}
            loading={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPostsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AISocialCampaigns;
