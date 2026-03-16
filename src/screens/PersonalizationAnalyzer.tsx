<<<<<<< HEAD
import { useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Psychology,
  CheckCircle,
  Warning,
  TipsAndUpdates,
  Business,
  LocationOn,
  TrendingUp,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { aiApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Card } from '../components/common/Card';

const validationSchema = Yup.object({
  subject: Yup.string().required('Subject is required'),
  body: Yup.string().required('Body is required'),
});

const PersonalizationAnalyzer = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (values: any) => {
    setLoading(true);
    try {
      const response = await aiApi.analyzePersonalization(values);
      setAnalysis(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze personalization');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'EXCELLENT': return '#10B981';
      case 'HIGH': return '#3B82F6';
      case 'MEDIUM': return '#F59E0B';
      case 'LOW': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'EXCELLENT': return <CheckCircle sx={{ color: '#10B981' }} />;
      case 'HIGH': return <TrendingUp sx={{ color: '#3B82F6' }} />;
      case 'MEDIUM': return <Warning sx={{ color: '#F59E0B' }} />;
      case 'LOW': return <Warning sx={{ color: '#EF4444' }} />;
      default: return null;
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Personalization Analyzer
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Analyze your email content and get a personalization score
        </Typography>
      </Box>

      <Box display="flex" gap={3}>
        <Box flex={1}>
          <Card>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Analyze Your Email
            </Typography>

            <Formik
              initialValues={{
                subject: '',
                body: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleAnalyze}
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
                      rows={12}
                      placeholder="Paste your email content here..."
                    />

                    <Alert severity="info">
                      <Typography variant="body2">
                        Use variables like {'{firstName}'}, {'{company}'}, {'{industry}'} for better personalization
                      </Typography>
                    </Alert>

                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Psychology />}
                      loading={isSubmitting || loading}
                      fullWidth
                    >
                      Analyze Personalization
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Card>
        </Box>

        <Box flex={1}>
          {analysis ? (
            <Box display="flex" flexDirection="column" gap={3}>
              <Card>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  {getLevelIcon(analysis.level)}
                  <Typography variant="h6" fontWeight={600}>
                    Personalization Score
                  </Typography>
                </Box>

                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Overall Score
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: getLevelColor(analysis.level) }}>
                      {analysis.score}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getLevelColor(analysis.level),
                      },
                    }}
                  />
                </Box>

                <Chip
                  label={`Level: ${analysis.level}`}
                  sx={{
                    backgroundColor: getLevelColor(analysis.level),
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Card>

              <Card>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Detected Personalization
                </Typography>

                {analysis.detectedPersonalization.length === 0 ? (
                  <Alert severity="warning">
                    No personalization elements detected. Add dynamic variables and context-specific content.
                  </Alert>
                ) : (
                  <List>
                    {analysis.detectedPersonalization.map((item: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle sx={{ color: '#10B981' }} />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Card>

              <Card>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Personalization Features
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Business sx={{ color: analysis.hasIndustryContent ? '#10B981' : '#9CA3AF' }} />
                    <Typography variant="body2">
                      Industry-specific content
                    </Typography>
                    {analysis.hasIndustryContent && (
                      <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationOn sx={{ color: analysis.hasLocationContent ? '#10B981' : '#9CA3AF' }} />
                    <Typography variant="body2">
                      Location-aware content
                    </Typography>
                    {analysis.hasLocationContent && (
                      <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUp sx={{ color: analysis.hasBehaviorContent ? '#10B981' : '#9CA3AF' }} />
                    <Typography variant="body2">
                      Behavior-based content
                    </Typography>
                    {analysis.hasBehaviorContent && (
                      <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" fontWeight={600}>
                      Dynamic Variables:
                    </Typography>
                    <Chip
                      label={analysis.dynamicVariablesCount}
                      size="small"
                      color={analysis.dynamicVariablesCount > 0 ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
              </Card>

              {analysis.suggestions.length > 0 && (
                <Card>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TipsAndUpdates sx={{ color: '#F59E0B' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Improvement Suggestions
                    </Typography>
                  </Box>

                  <List>
                    {analysis.suggestions.map((suggestion: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TipsAndUpdates sx={{ color: '#F59E0B' }} />
                        </ListItemIcon>
                        <ListItemText primary={suggestion} />
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
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <Typography variant="body2">
                      <strong>80-100:</strong> Excellent personalization
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                    <Typography variant="body2">
                      <strong>60-79:</strong> High personalization
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                    <Typography variant="body2">
                      <strong>40-59:</strong> Medium personalization
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                    <Typography variant="body2">
                      <strong>0-39:</strong> Low personalization
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          ) : (
            <Card>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                <Psychology sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={1}>
                  No Analysis Yet
                </Typography>
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  Enter your email content and click "Analyze" to get personalization insights
                </Typography>
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PersonalizationAnalyzer;
=======
import { useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Psychology,
  CheckCircle,
  Warning,
  TipsAndUpdates,
  Business,
  LocationOn,
  TrendingUp,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { aiApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Card } from '../components/common/Card';

const validationSchema = Yup.object({
  subject: Yup.string().required('Subject is required'),
  body: Yup.string().required('Body is required'),
});

const PersonalizationAnalyzer = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (values: any) => {
    setLoading(true);
    try {
      const response = await aiApi.analyzePersonalization(values);
      setAnalysis(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze personalization');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'EXCELLENT': return '#10B981';
      case 'HIGH': return '#3B82F6';
      case 'MEDIUM': return '#F59E0B';
      case 'LOW': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'EXCELLENT': return <CheckCircle sx={{ color: '#10B981' }} />;
      case 'HIGH': return <TrendingUp sx={{ color: '#3B82F6' }} />;
      case 'MEDIUM': return <Warning sx={{ color: '#F59E0B' }} />;
      case 'LOW': return <Warning sx={{ color: '#EF4444' }} />;
      default: return null;
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Personalization Analyzer
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Analyze your email content and get a personalization score
        </Typography>
      </Box>

      <Box display="flex" gap={3}>
        <Box flex={1}>
          <Card>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Analyze Your Email
            </Typography>

            <Formik
              initialValues={{
                subject: '',
                body: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleAnalyze}
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
                      rows={12}
                      placeholder="Paste your email content here..."
                    />

                    <Alert severity="info">
                      <Typography variant="body2">
                        Use variables like {'{firstName}'}, {'{company}'}, {'{industry}'} for better personalization
                      </Typography>
                    </Alert>

                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Psychology />}
                      loading={isSubmitting || loading}
                      fullWidth
                    >
                      Analyze Personalization
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Card>
        </Box>

        <Box flex={1}>
          {analysis ? (
            <Box display="flex" flexDirection="column" gap={3}>
              <Card>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  {getLevelIcon(analysis.level)}
                  <Typography variant="h6" fontWeight={600}>
                    Personalization Score
                  </Typography>
                </Box>

                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Overall Score
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: getLevelColor(analysis.level) }}>
                      {analysis.score}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getLevelColor(analysis.level),
                      },
                    }}
                  />
                </Box>

                <Chip
                  label={`Level: ${analysis.level}`}
                  sx={{
                    backgroundColor: getLevelColor(analysis.level),
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Card>

              <Card>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Detected Personalization
                </Typography>

                {analysis.detectedPersonalization.length === 0 ? (
                  <Alert severity="warning">
                    No personalization elements detected. Add dynamic variables and context-specific content.
                  </Alert>
                ) : (
                  <List>
                    {analysis.detectedPersonalization.map((item: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle sx={{ color: '#10B981' }} />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Card>

              <Card>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Personalization Features
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Business sx={{ color: analysis.hasIndustryContent ? '#10B981' : '#9CA3AF' }} />
                    <Typography variant="body2">
                      Industry-specific content
                    </Typography>
                    {analysis.hasIndustryContent && (
                      <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationOn sx={{ color: analysis.hasLocationContent ? '#10B981' : '#9CA3AF' }} />
                    <Typography variant="body2">
                      Location-aware content
                    </Typography>
                    {analysis.hasLocationContent && (
                      <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUp sx={{ color: analysis.hasBehaviorContent ? '#10B981' : '#9CA3AF' }} />
                    <Typography variant="body2">
                      Behavior-based content
                    </Typography>
                    {analysis.hasBehaviorContent && (
                      <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" fontWeight={600}>
                      Dynamic Variables:
                    </Typography>
                    <Chip
                      label={analysis.dynamicVariablesCount}
                      size="small"
                      color={analysis.dynamicVariablesCount > 0 ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
              </Card>

              {analysis.suggestions.length > 0 && (
                <Card>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TipsAndUpdates sx={{ color: '#F59E0B' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Improvement Suggestions
                    </Typography>
                  </Box>

                  <List>
                    {analysis.suggestions.map((suggestion: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TipsAndUpdates sx={{ color: '#F59E0B' }} />
                        </ListItemIcon>
                        <ListItemText primary={suggestion} />
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
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <Typography variant="body2">
                      <strong>80-100:</strong> Excellent personalization
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                    <Typography variant="body2">
                      <strong>60-79:</strong> High personalization
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                    <Typography variant="body2">
                      <strong>40-59:</strong> Medium personalization
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                    <Typography variant="body2">
                      <strong>0-39:</strong> Low personalization
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          ) : (
            <Card>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                <Psychology sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={1}>
                  No Analysis Yet
                </Typography>
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  Enter your email content and click "Analyze" to get personalization insights
                </Typography>
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PersonalizationAnalyzer;
>>>>>>> 5e525f2 (Frontend updated)
