import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  AutoAwesome,
  ContentCopy,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { aiApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Card } from '../components/common/Card';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const validationSchema = Yup.object({
  tone: Yup.string().required('Tone is required'),
  industry: Yup.string().required('Industry is required'),
  targetAudience: Yup.string().required('Target audience is required'),
  productService: Yup.string().required('Product/Service is required'),
  keyPoints: Yup.string().required('Key points are required'),
});

const AIContentGenerator = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [subjectLines, setSubjectLines] = useState<string[]>([]);
  const [emailBody, setEmailBody] = useState('');
  const [ctas, setCtas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [personalizationScore, setPersonalizationScore] = useState<number | null>(null);

  const handleGenerateSubjects = async (values: any) => {
    setLoading(true);
    try {
      const response = await aiApi.generateSubjectLines({
        ...values,
        contentType: 'SUBJECT',
        variantsCount: 10,
      });
      setSubjectLines(response.data.variants);
      setPersonalizationScore(response.data.personalizationScore);
      toast.success('Subject lines generated!');
    } catch (error) {
      toast.error('Failed to generate subject lines');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBody = async (values: any) => {
    setLoading(true);
    try {
      const response = await aiApi.generateEmailBody({
        ...values,
        contentType: 'BODY',
      });
      setEmailBody(response.data.selectedContent);
      setPersonalizationScore(response.data.personalizationScore);
      toast.success('Email body generated!');
    } catch (error) {
      toast.error('Failed to generate email body');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCTA = async (values: any) => {
    setLoading(true);
    try {
      const response = await aiApi.generateCTA({
        contentType: 'CTA',
        tone: values.tone,
        productService: values.productService,
      });
      setCtas(response.data.variants);
      toast.success('CTAs generated!');
    } catch (error) {
      toast.error('Failed to generate CTAs');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const renderSubjectTab = (values: any, isSubmitting: boolean) => (
    <Box display="flex" gap={3}>
      <Box flex={1}>
        <Card>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Generate Subject Lines
          </Typography>
          <Box display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth>
              <InputLabel>Tone</InputLabel>
              <Select name="tone" value={values.tone} label="Tone">
                <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                <MenuItem value="FRIENDLY">Friendly</MenuItem>
                <MenuItem value="SALES">Sales</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>

            <TextField name="industry" label="Industry" placeholder="e.g., Healthcare, Technology" />
            <TextField name="targetAudience" label="Target Audience" placeholder="e.g., Marketing Managers" />
            <TextField name="productService" label="Product/Service" placeholder="e.g., Email Marketing Platform" />
            <TextField
              name="keyPoints"
              label="Key Points"
              multiline
              rows={4}
              placeholder="What should the email communicate?"
            />

            <Button
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={() => handleGenerateSubjects(values)}
              loading={loading || isSubmitting}
              fullWidth
            >
              Generate Subject Lines
            </Button>
          </Box>
        </Card>
      </Box>

      <Box flex={1}>
        <Card>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600}>
              Generated Subject Lines
            </Typography>
            {personalizationScore !== null && (
              <Chip
                label={`Score: ${personalizationScore}`}
                color={personalizationScore >= 70 ? 'success' : 'warning'}
              />
            )}
          </Box>

          {subjectLines.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={6}>
              <AutoAwesome sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                Click "Generate" to create AI-powered subject lines
              </Typography>
            </Box>
          ) : (
            <List>
              {subjectLines.map((subject, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': { backgroundColor: 'rgba(168, 85, 247, 0.05)' },
                  }}
                  secondaryAction={
                    <IconButton onClick={() => copyToClipboard(subject)}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText primary={subject} />
                </ListItem>
              ))}
            </List>
          )}
        </Card>
      </Box>
    </Box>
  );

  const renderBodyTab = (values: any, isSubmitting: boolean) => (
    <Box display="flex" gap={3}>
      <Box flex={1}>
        <Card>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Generate Email Body
          </Typography>
          <Box display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth>
              <InputLabel>Tone</InputLabel>
              <Select name="tone" value={values.tone} label="Tone">
                <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                <MenuItem value="FRIENDLY">Friendly</MenuItem>
                <MenuItem value="SALES">Sales</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>

            <TextField name="industry" label="Industry" />
            <TextField name="targetAudience" label="Target Audience" />
            <TextField name="productService" label="Product/Service" />
            <TextField name="keyPoints" label="Key Points" multiline rows={3} />
            <TextField
              name="context"
              label="Additional Context (Optional)"
              multiline
              rows={2}
              placeholder="Any specific details or requirements"
            />

            <Button
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={() => handleGenerateBody(values)}
              loading={loading || isSubmitting}
              fullWidth
            >
              Generate Email Body
            </Button>
          </Box>
        </Card>
      </Box>

      <Box flex={1}>
        <Card>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600}>
              Generated Email Body
            </Typography>
            {emailBody && (
              <IconButton onClick={() => copyToClipboard(emailBody)}>
                <ContentCopy />
              </IconButton>
            )}
          </Box>

          {!emailBody ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={6}>
              <AutoAwesome sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                Click "Generate" to create AI-powered email content
              </Typography>
            </Box>
          ) : (
            <Box>
              {personalizationScore !== null && (
                <Alert severity={personalizationScore >= 70 ? 'success' : 'info'} sx={{ mb: 2 }}>
                  Personalization Score: {personalizationScore}/100
                </Alert>
              )}
              <Box
                sx={{
                  p: 2,
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: 2,
                  backgroundColor: 'rgba(168, 85, 247, 0.02)',
                }}
                dangerouslySetInnerHTML={{ __html: emailBody }}
              />
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );

  const renderCTATab = (values: any, isSubmitting: boolean) => (
    <Box display="flex" gap={3}>
      <Box flex={1}>
        <Card>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Generate Call-to-Action
          </Typography>
          <Box display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth>
              <InputLabel>Tone</InputLabel>
              <Select name="tone" value={values.tone} label="Tone">
                <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                <MenuItem value="FRIENDLY">Friendly</MenuItem>
                <MenuItem value="SALES">Sales</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>

            <TextField name="productService" label="Product/Service" />

            <Button
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={() => handleGenerateCTA(values)}
              loading={loading || isSubmitting}
              fullWidth
            >
              Generate CTAs
            </Button>
          </Box>
        </Card>
      </Box>

      <Box flex={1}>
        <Card>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Generated CTAs
          </Typography>

          {ctas.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={6}>
              <AutoAwesome sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                Click "Generate" to create compelling CTAs
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {ctas.map((cta, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': { backgroundColor: 'rgba(168, 85, 247, 0.05)' },
                  }}
                >
                  <Button variant="contained" size="small">
                    {cta}
                  </Button>
                  <IconButton onClick={() => copyToClipboard(cta)} size="small">
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          AI Content Generator
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Generate engaging email content powered by AI
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> AI generation uses smart templates. For enhanced results, configure OpenAI API key in backend settings.
        </Typography>
      </Alert>

      <Formik
        initialValues={{
          tone: 'PROFESSIONAL',
          industry: '',
          targetAudience: '',
          productService: '',
          keyPoints: '',
          context: '',
        }}
        validationSchema={validationSchema}
        onSubmit={() => {}}
      >
        {({ values, isSubmitting }) => (
          <Form>
            <Card>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label="Subject Lines" />
                <Tab label="Email Body" />
                <Tab label="Call-to-Action" />
              </Tabs>

              {activeTab === 0 && renderSubjectTab(values, isSubmitting)}
              {activeTab === 1 && renderBodyTab(values, isSubmitting)}
              {activeTab === 2 && renderCTATab(values, isSubmitting)}
            </Card>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AIContentGenerator;
