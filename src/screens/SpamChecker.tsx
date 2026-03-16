<<<<<<< HEAD
import { useState } from 'react';
import { Box, Typography, Alert, Chip, List, ListItem, ListItemText, LinearProgress } from '@mui/material';
import { Warning, CheckCircle, Error as ErrorIcon, Info } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { deliverabilityApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Card } from '../components/common/Card';

const validationSchema = Yup.object({
  subject: Yup.string().required('Subject is required'),
  body: Yup.string().required('Body is required'),
});

const SpamChecker = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await deliverabilityApi.checkSpam(values);
      setResult(response.data);
    } catch (error) {
      toast.error('Failed to check spam score');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return '#10B981';
      case 'MEDIUM': return '#F59E0B';
      case 'HIGH': return '#EF4444';
      case 'CRITICAL': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW': return <CheckCircle sx={{ color: '#10B981' }} />;
      case 'MEDIUM': return <Info sx={{ color: '#F59E0B' }} />;
      case 'HIGH': return <Warning sx={{ color: '#EF4444' }} />;
      case 'CRITICAL': return <ErrorIcon sx={{ color: '#DC2626' }} />;
      default: return null;
    }
  };

  const getScorePercentage = (score: number) => {
    // Convert score to percentage (0-100)
    // Higher score = worse, so invert it
    return Math.max(0, 100 - (score * 2));
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Spam Checker
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Check your email content for spam keywords and get a deliverability score
        </Typography>
      </Box>

      <Box display="flex" gap={3}>
        <Box flex={1}>
          <Card>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Check Your Email
            </Typography>

            <Formik
              initialValues={{
                subject: '',
                body: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
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

                    <Button
                      type="submit"
                      variant="contained"
                      loading={isSubmitting || loading}
                      fullWidth
                    >
                      Check Spam Score
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Card>
        </Box>

        <Box flex={1}>
          {result ? (
            <Box display="flex" flexDirection="column" gap={3}>
              <Card>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  {getRiskIcon(result.riskLevel)}
                  <Typography variant="h6" fontWeight={600}>
                    Spam Score Results
                  </Typography>
                </Box>

                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Spam Score
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: getRiskColor(result.riskLevel) }}>
                      {result.spamScore}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getScorePercentage(result.spamScore)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getRiskColor(result.riskLevel),
                      },
                    }}
                  />
                </Box>

                <Box mb={3}>
                  <Chip
                    label={`Risk Level: ${result.riskLevel}`}
                    sx={{
                      backgroundColor: getRiskColor(result.riskLevel),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Alert
                  severity={
                    result.riskLevel === 'LOW' ? 'success' :
                    result.riskLevel === 'MEDIUM' ? 'info' :
                    result.riskLevel === 'HIGH' ? 'warning' : 'error'
                  }
                >
                  {result.recommendation}
                </Alert>
              </Card>

              {result.detectedKeywords && result.detectedKeywords.length > 0 && (
                <Card>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Detected Spam Keywords ({result.detectedKeywords.length})
                  </Typography>
                  <List dense>
                    {result.detectedKeywords.map((keyword: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={keyword}
                          primaryTypographyProps={{
                            color: 'error',
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}

              <Card>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Score Guide
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                      }}
                    />
                    <Typography variant="body2">
                      <strong>0-10:</strong> Safe - Low spam risk
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: '#F59E0B',
                      }}
                    />
                    <Typography variant="body2">
                      <strong>11-20:</strong> Caution - Some spam keywords
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                      }}
                    />
                    <Typography variant="body2">
                      <strong>21-30:</strong> Warning - High spam risk
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: '#DC2626',
                      }}
                    />
                    <Typography variant="body2">
                      <strong>31+:</strong> Critical - Will likely be marked as spam
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          ) : (
            <Card>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                <Warning sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={1}>
                  No Results Yet
                </Typography>
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  Enter your email subject and body, then click "Check Spam Score" to see results
                </Typography>
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SpamChecker;
=======
import { useState } from 'react';
import { Box, Typography, Alert, Chip, List, ListItem, ListItemText, LinearProgress } from '@mui/material';
import { Warning, CheckCircle, Error as ErrorIcon, Info } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { deliverabilityApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Card } from '../components/common/Card';

const validationSchema = Yup.object({
  subject: Yup.string().required('Subject is required'),
  body: Yup.string().required('Body is required'),
});

const SpamChecker = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await deliverabilityApi.checkSpam(values);
      setResult(response.data);
    } catch (error) {
      toast.error('Failed to check spam score');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return '#10B981';
      case 'MEDIUM': return '#F59E0B';
      case 'HIGH': return '#EF4444';
      case 'CRITICAL': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW': return <CheckCircle sx={{ color: '#10B981' }} />;
      case 'MEDIUM': return <Info sx={{ color: '#F59E0B' }} />;
      case 'HIGH': return <Warning sx={{ color: '#EF4444' }} />;
      case 'CRITICAL': return <ErrorIcon sx={{ color: '#DC2626' }} />;
      default: return null;
    }
  };

  const getScorePercentage = (score: number) => {
    // Convert score to percentage (0-100)
    // Higher score = worse, so invert it
    return Math.max(0, 100 - (score * 2));
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Spam Checker
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Check your email content for spam keywords and get a deliverability score
        </Typography>
      </Box>

      <Box display="flex" gap={3}>
        <Box flex={1}>
          <Card>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Check Your Email
            </Typography>

            <Formik
              initialValues={{
                subject: '',
                body: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
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

                    <Button
                      type="submit"
                      variant="contained"
                      loading={isSubmitting || loading}
                      fullWidth
                    >
                      Check Spam Score
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Card>
        </Box>

        <Box flex={1}>
          {result ? (
            <Box display="flex" flexDirection="column" gap={3}>
              <Card>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  {getRiskIcon(result.riskLevel)}
                  <Typography variant="h6" fontWeight={600}>
                    Spam Score Results
                  </Typography>
                </Box>

                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Spam Score
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: getRiskColor(result.riskLevel) }}>
                      {result.spamScore}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getScorePercentage(result.spamScore)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getRiskColor(result.riskLevel),
                      },
                    }}
                  />
                </Box>

                <Box mb={3}>
                  <Chip
                    label={`Risk Level: ${result.riskLevel}`}
                    sx={{
                      backgroundColor: getRiskColor(result.riskLevel),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Alert
                  severity={
                    result.riskLevel === 'LOW' ? 'success' :
                    result.riskLevel === 'MEDIUM' ? 'info' :
                    result.riskLevel === 'HIGH' ? 'warning' : 'error'
                  }
                >
                  {result.recommendation}
                </Alert>
              </Card>

              {result.detectedKeywords && result.detectedKeywords.length > 0 && (
                <Card>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Detected Spam Keywords ({result.detectedKeywords.length})
                  </Typography>
                  <List dense>
                    {result.detectedKeywords.map((keyword: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={keyword}
                          primaryTypographyProps={{
                            color: 'error',
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}

              <Card>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Score Guide
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                      }}
                    />
                    <Typography variant="body2">
                      <strong>0-10:</strong> Safe - Low spam risk
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: '#F59E0B',
                      }}
                    />
                    <Typography variant="body2">
                      <strong>11-20:</strong> Caution - Some spam keywords
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                      }}
                    />
                    <Typography variant="body2">
                      <strong>21-30:</strong> Warning - High spam risk
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: '#DC2626',
                      }}
                    />
                    <Typography variant="body2">
                      <strong>31+:</strong> Critical - Will likely be marked as spam
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          ) : (
            <Card>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                <Warning sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={1}>
                  No Results Yet
                </Typography>
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  Enter your email subject and body, then click "Check Spam Score" to see results
                </Typography>
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SpamChecker;
>>>>>>> 5e525f2 (Frontend updated)
