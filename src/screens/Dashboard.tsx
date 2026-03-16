import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Typography, Chip } from '@mui/material';
import {
  Campaign as CampaignIcon,
  Email as EmailIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import styled from 'styled-components';
import { fetchCampaignsRequest } from '../actions/campaignActions';
import { type RootState } from '../redux/reducer/rootReducer';
import { Card } from '../components/common/Card';
import { DataTable } from '../components/common/DataTable';

const StatsCard = styled(Card)`
  && {
    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    border: 1px solid rgba(168, 85, 247, 0.2);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-8px);
      border-color: rgba(168, 85, 247, 0.5);
      box-shadow: 0 12px 24px rgba(168, 85, 247, 0.3);
    }
  }
`;

const StatIcon = styled(Box)`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  margin-bottom: 16px;

  svg {
    font-size: 32px;
    color: white;
  }
`;

const StatValue = styled(Typography)`
  && {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #A855F7 0%, #C084FC 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
`;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { campaigns, loading } = useSelector((state: RootState) => state.campaigns);

  useEffect(() => {
    dispatch(fetchCampaignsRequest());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Campaigns',
      value: campaigns.length,
      icon: <CampaignIcon />,
      color: '#A855F7',
    },
    {
      title: 'Active Campaigns',
      value: campaigns.filter((c) => c.isActive).length,
      icon: <TrendingUpIcon />,
      color: '#10B981',
    },
    {
      title: 'Total Emails Sent',
      value: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
      icon: <EmailIcon />,
      color: '#3B82F6',
    },
    {
      title: 'Total Clients',
      value: campaigns.reduce((sum, c) => sum + c.totalClients, 0),
      icon: <PeopleIcon />,
      color: '#F59E0B',
    },
  ];

  const columns = [
    { id: 'name', label: 'Campaign Name', minWidth: 200 },
    { 
      id: 'template', 
      label: 'Template', 
      minWidth: 150,
      format: (value: any) => value?.name || '-'
    },
    { id: 'dailyLimit', label: 'Daily Limit', minWidth: 100 },
    {
      id: 'progress',
      label: 'Progress',
      minWidth: 150,
      format: (_: any, row: any) => (
        <Box>
          <Typography variant="body2">
            {row.sentCount} / {row.totalClients}
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 6,
              backgroundColor: 'rgba(168, 85, 247, 0.2)',
              borderRadius: 3,
              mt: 0.5,
            }}
          >
            <Box
              sx={{
                width: `${(row.sentCount / row.totalClients) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #A855F7 0%, #C084FC 100%)',
                borderRadius: 3,
              }}
            />
          </Box>
        </Box>
      ),
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 100,
      format: (value: boolean) => (
        <Chip
          label={value ? 'Active' : 'Inactive'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={700} mb={4}>
          Dashboard Overview
        </Typography>

        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatsCard>
                <StatIcon>{stat.icon}</StatIcon>
                <StatValue>{stat.value}</StatValue>
                <Typography variant="body2" color="textSecondary">
                  {stat.title}
                </Typography>
              </StatsCard>
            </Grid>
          ))}
        </Grid>

        <Card title="Recent Campaigns">
          <DataTable columns={columns} data={campaigns} loading={loading} />
        </Card>
      </Box>
  );
};

export default Dashboard;
