<<<<<<< HEAD
import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Email,
  TouchApp,
  ShoppingCart,
  Unsubscribe,
  Schedule,
  TipsAndUpdates,
  Star,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { performanceApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Card } from '../components/common/Card';

const validationSchema = Yup.object({
  subject: Yup.string().required('Subject is required'),
  body: Yup.string().required('Body is required'),
});

const EmailPerformancePredictor = () => {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (values: any) => {
    setLoading(true);
    try {
      const response = await performanceApi.predictPerformance(values);
      setPrediction(response.data);
      toast.success('Performance prediction complete!');
    } catch (error) {
      toast.error('Failed to predict performance');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return '#10B981';
    if (grade.startsWith('B')) return '#3B82F6';
    if (grade.startsWith('C')) return '#F59E0B';
    return '#EF4444';
  };

  const MetricCard = ({ icon, title, value, subtitle, color }: any) => (
    <Card>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        {icon}
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight={700} sx={{ color }} mb={1}>
        {value}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {subtitle}
      </Typography>
    </Card>
  );

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          📊 Email Performance Predictor
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Predict your email campaign performance before sending
        </Typography>
      </Box>

      <Box display="flex" gap={3}>
        <Box flex={1}>
          <Card>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Enter Email Content
            </Typography>

            <Formik
              initialValues={{
                subject: '',
                body: '',
                industry: '',
                targetAudience: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handlePredict}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Box display="flex" flexDirection="column" gap={3}>
                    <TextField
                      name="subject"
                      label="Email Subject"
                      placeholder="Enter your email subject line"
                    />

                    <TextField
                      name="body"
                      label="Email Body"
                      multiline
                      rows={10}
                      placeholder="Paste your email content here..."
                    />

                    <TextField
                      name="industry"
                      label="Industry (Optional)"
                      placeholder="e.g., Technology, Retail, Finance"
                    />

                    <TextField
                      name="targetAudience"
                      label="Target Audience (Optional)"
                      placeholder="e.g., Marketing Managers, CEOs"
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<TrendingUp />}
                      loading={isSubmitting || loading}
                      fullWidth
                    >
                      Predict Performance
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Card>
        </Box>

        <Box flex={1}>
          {prediction ? (
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Overall Score */}
              <Card>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    Performance Score
                  </Typography>
                  <Chip
                    label={`Grade: ${prediction.performanceGrade}`}
                    sx={{
                      backgroundColor: getGradeColor(prediction.performanceGrade),
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '16px',
                    }}
                  />
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Overall Performance
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: getGradeColor(prediction.performanceGrade) }}>
                      {prediction.performanceScore}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={prediction.performanceScore}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getGradeColor(prediction.performanceGrade),
                      },
                    }}
                  />
                </Box>

                <Alert severity={prediction.performanceScore >= 70 ? 'success' : prediction.performanceScore >= 50 ? 'info' : 'warning'}>
                  {prediction.performanceScore >= 70 ? 'Excellent! Your email is optimized for high performance.' :
                   prediction.performanceScore >= 50 ? 'Good performance expected. Consider implementing suggestions below.' :
                   'Performance can be improved. Review recommendations carefully.'}
                </Alert>
              </Card>

              {/* Key Metrics */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MetricCard
                    icon={<Email sx={{ color: '#6366F1', fontSize: 32 }} />}
                    title="Open Rate"
                    value={`${prediction.predictedOpenRate}%`}
                    subtitle="Expected opens"
                    color="#6366F1"
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricCard
                    icon={<TouchApp sx={{ color: '#10B981', fontSize: 32 }} />}
                    title="Click Rate"
                    value={`${prediction.predictedClickRate}%`}
                    subtitle="Expected clicks"
                    color="#10B981"
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricCard
                    icon={<ShoppingCart sx={{ color: '#F59E0B', fontSize: 32 }} />}
                    title="Conversion"
                    value={`${prediction.predictedConversionRate}%`}
                    subtitle="Expected conversions"
                    color="#F59E0B"
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricCard
                    icon={<Unsubscribe sx={{ color: '#EF4444', fontSize: 32 }} />}
                    title="Unsubscribe"
                    value={`${prediction.predictedUnsubscribeRate}%`}
                    subtitle="Expected unsubscribes"
                    color="#EF4444"
                  />
                </Grid>
              </Grid>

              {/* Best Send Time */}
              {prediction.bestSendTime && (
                <Card>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Schedule sx={{ color: '#A855F7' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Best Send Time
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2} mb={2}>
                    <Chip
                      label={`📅 ${prediction.bestSendTime.bestDay}`}
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={`🕐 ${prediction.bestSendTime.bestTime}`}
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Avoid: {prediction.bestSendTime.avoidDays.join(', ')}
                  </Typography>
                </Card>
              )}

              {/* Estimated Reach */}
              {prediction.estimatedReach && (
                <Card>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Estimated Reach (1000 recipients)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {prediction.estimatedReach.expectedOpens}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Opens
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#10B981' }}>
                          {prediction.estimatedReach.expectedClicks}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Clicks
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              )}

              {/* Recommendations */}
              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <Card>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TipsAndUpdates sx={{ color: '#F59E0B' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Recommendations
                    </Typography>
                  </Box>
                  <List>
                    {prediction.recommendations.map((rec: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Star sx={{ color: '#F59E0B' }} />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}

              {/* Performance Benchmarks */}
              <Card>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Industry Benchmarks
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Open Rate</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        Industry Avg: 20-25%
                      </Typography>
                    </Box>
                    <Divider />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Click Rate</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        Industry Avg: 2-3%
                      </Typography>
                    </Box>
                    <Divider />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Conversion Rate</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        Industry Avg: 0.5-1%
                      </Typography>
                    </Box>
                    <Divider />
                  </Box>
                </Box>
              </Card>
            </Box>
          ) : (
            <Card>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                <TrendingUp sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={1}>
                  No Prediction Yet
                </Typography>
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  Enter your email content and click "Predict Performance" to see detailed analytics
                </Typography>
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default EmailPerformancePredictor;
=======
import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Email,
  TouchApp,
  ShoppingCart,
  Unsubscribe,
  Schedule,
  TipsAndUpdates,
  Star,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { performanceApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Card } from '../components/common/Card';

const validationSchema = Yup.object({
  subject: Yup.string().required('Subject is required'),
  body: Yup.string().required('Body is required'),
});

const EmailPerformancePredictor = () => {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (values: any) => {
    setLoading(true);
    try {
      const response = await performanceApi.predictPerformance(values);
      setPrediction(response.data);
      toast.success('Performance prediction complete!');
    } catch (error) {
      toast.error('Failed to predict performance');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return '#10B981';
    if (grade.startsWith('B')) return '#3B82F6';
    if (grade.startsWith('C')) return '#F59E0B';
    return '#EF4444';
  };

  const MetricCard = ({ icon, title, value, subtitle, color }: any) => (
    <Card>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        {icon}
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight={700} sx={{ color }} mb={1}>
        {value}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {subtitle}
      </Typography>
    </Card>
  );

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          📊 Email Performance Predictor
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Predict your email campaign performance before sending
        </Typography>
      </Box>

      <Box display="flex" gap={3}>
        <Box flex={1}>
          <Card>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Enter Email Content
            </Typography>

            <Formik
              initialValues={{
                subject: '',
                body: '',
                industry: '',
                targetAudience: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handlePredict}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Box display="flex" flexDirection="column" gap={3}>
                    <TextField
                      name="subject"
                      label="Email Subject"
                      placeholder="Enter your email subject line"
                    />

                    <TextField
                      name="body"
                      label="Email Body"
                      multiline
                      rows={10}
                      placeholder="Paste your email content here..."
                    />

                    <TextField
                      name="industry"
                      label="Industry (Optional)"
                      placeholder="e.g., Technology, Retail, Finance"
                    />

                    <TextField
                      name="targetAudience"
                      label="Target Audience (Optional)"
                      placeholder="e.g., Marketing Managers, CEOs"
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<TrendingUp />}
                      loading={isSubmitting || loading}
                      fullWidth
                    >
                      Predict Performance
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Card>
        </Box>

        <Box flex={1}>
          {prediction ? (
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Overall Score */}
              <Card>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    Performance Score
                  </Typography>
                  <Chip
                    label={`Grade: ${prediction.performanceGrade}`}
                    sx={{
                      backgroundColor: getGradeColor(prediction.performanceGrade),
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '16px',
                    }}
                  />
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Overall Performance
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: getGradeColor(prediction.performanceGrade) }}>
                      {prediction.performanceScore}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={prediction.performanceScore}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getGradeColor(prediction.performanceGrade),
                      },
                    }}
                  />
                </Box>

                <Alert severity={prediction.performanceScore >= 70 ? 'success' : prediction.performanceScore >= 50 ? 'info' : 'warning'}>
                  {prediction.performanceScore >= 70 ? 'Excellent! Your email is optimized for high performance.' :
                   prediction.performanceScore >= 50 ? 'Good performance expected. Consider implementing suggestions below.' :
                   'Performance can be improved. Review recommendations carefully.'}
                </Alert>
              </Card>

              {/* Key Metrics */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MetricCard
                    icon={<Email sx={{ color: '#6366F1', fontSize: 32 }} />}
                    title="Open Rate"
                    value={`${prediction.predictedOpenRate}%`}
                    subtitle="Expected opens"
                    color="#6366F1"
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricCard
                    icon={<TouchApp sx={{ color: '#10B981', fontSize: 32 }} />}
                    title="Click Rate"
                    value={`${prediction.predictedClickRate}%`}
                    subtitle="Expected clicks"
                    color="#10B981"
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricCard
                    icon={<ShoppingCart sx={{ color: '#F59E0B', fontSize: 32 }} />}
                    title="Conversion"
                    value={`${prediction.predictedConversionRate}%`}
                    subtitle="Expected conversions"
                    color="#F59E0B"
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricCard
                    icon={<Unsubscribe sx={{ color: '#EF4444', fontSize: 32 }} />}
                    title="Unsubscribe"
                    value={`${prediction.predictedUnsubscribeRate}%`}
                    subtitle="Expected unsubscribes"
                    color="#EF4444"
                  />
                </Grid>
              </Grid>

              {/* Best Send Time */}
              {prediction.bestSendTime && (
                <Card>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Schedule sx={{ color: '#A855F7' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Best Send Time
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2} mb={2}>
                    <Chip
                      label={`📅 ${prediction.bestSendTime.bestDay}`}
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={`🕐 ${prediction.bestSendTime.bestTime}`}
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Avoid: {prediction.bestSendTime.avoidDays.join(', ')}
                  </Typography>
                </Card>
              )}

              {/* Estimated Reach */}
              {prediction.estimatedReach && (
                <Card>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Estimated Reach (1000 recipients)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {prediction.estimatedReach.expectedOpens}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Opens
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#10B981' }}>
                          {prediction.estimatedReach.expectedClicks}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Clicks
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              )}

              {/* Recommendations */}
              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <Card>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TipsAndUpdates sx={{ color: '#F59E0B' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Recommendations
                    </Typography>
                  </Box>
                  <List>
                    {prediction.recommendations.map((rec: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Star sx={{ color: '#F59E0B' }} />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}

              {/* Performance Benchmarks */}
              <Card>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Industry Benchmarks
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Open Rate</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        Industry Avg: 20-25%
                      </Typography>
                    </Box>
                    <Divider />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Click Rate</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        Industry Avg: 2-3%
                      </Typography>
                    </Box>
                    <Divider />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Conversion Rate</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        Industry Avg: 0.5-1%
                      </Typography>
                    </Box>
                    <Divider />
                  </Box>
                </Box>
              </Card>
            </Box>
          ) : (
            <Card>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                <TrendingUp sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={1}>
                  No Prediction Yet
                </Typography>
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  Enter your email content and click "Predict Performance" to see detailed analytics
                </Typography>
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default EmailPerformancePredictor;
>>>>>>> 5e525f2 (Frontend updated)
