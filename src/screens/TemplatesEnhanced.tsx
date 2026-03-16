import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add,
  AutoAwesome,
  CloudUpload,
  Security,
  Code,
  Preview,
  Save,
  Close,
  ContentCopy,
  Warning,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { templateApi, aiApi, aiTemplateApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Card } from '../components/common/Card';
import styled from 'styled-components';

const HtmlEditor = styled.textarea`
  width: 100%;
  min-height: 400px;
  padding: 16px;
  background-color: #1E293B;
  color: #E2E8F0;
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #A855F7;
  }
`;

const UploadArea = styled(Box)`
  border: 2px dashed rgba(168, 85, 247, 0.5);
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(30, 41, 59, 0.3);

  &:hover {
    border-color: #A855F7;
    background-color: rgba(168, 85, 247, 0.1);
  }
`;

const validationSchema = Yup.object({
  name: Yup.string().required('Template name is required'),
  subject: Yup.string().required('Subject is required'),
  body: Yup.string().required('Body is required'),
});

const TemplatesEnhanced = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSavedContent, setShowSavedContent] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [savedSubjects, setSavedSubjects] = useState<any[]>([]);
  const [savedBodies, setSavedBodies] = useState<any[]>([]);
  const [validation, setValidation] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState('');

  useEffect(() => {
    fetchTemplates();
    fetchSavedContent();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templateApi.getAllTemplates();
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
    }
  };

  const fetchSavedContent = async () => {
    try {
      const [subjectsRes, bodiesRes] = await Promise.all([
        aiApi.getSavedByType('SUBJECT'),
        aiApi.getSavedByType('BODY'),
      ]);
      setSavedSubjects(subjectsRes.data);
      setSavedBodies(bodiesRes.data);
    } catch (error) {
      console.error('Failed to fetch saved content');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    toast.info('Generating template from image...');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('tone', 'PROFESSIONAL');
      formData.append('industry', 'General');
      formData.append('description', 'Email template');

      const response = await aiTemplateApi.generateFromImage(formData);
      const html = response.data.html;
      setGeneratedHtml(html);
      setFieldValue('body', html);
      toast.success('Template generated from image!');
    } catch (error) {
      toast.error('Failed to generate template from image');
    }
  };

  const handleValidateTemplate = async (subject: string, body: string) => {
    try {
      const response = await aiTemplateApi.validateTemplate({ subject, body });
      setValidation(response.data);
      setShowValidation(true);
    } catch (error) {
      toast.error('Failed to validate template');
    }
  };

  // const handleUseSavedContent = (content: any, field: string, setFieldValue: any) => {
  //   setFieldValue(field, content.generatedContent);
  //   aiApi.markAsUsed(content.id);
  //   toast.success('Content applied!');
  //   setShowSavedContent(false);
  // };

  const [showVariables, setShowVariables] = useState(false);
  const [variables, setVariables] = useState<any[]>([]);
  const [editingVariable, setEditingVariable] = useState<any>(null);
  const [showVariableModal, setShowVariableModal] = useState(false);

  const fetchVariables = async (templateId: number) => {
    try {
      const response = await aiTemplateApi.getVariables(templateId);
      setVariables(response.data);
    } catch (error) {
      console.error('Failed to fetch variables');
    }
  };

  const handleAddVariable = async (values: any) => {
    try {
      if (!selectedTemplate?.id) {
        toast.error('Please save template first');
        return;
      }
      
      if (editingVariable) {
        await aiTemplateApi.updateVariable(editingVariable.id, values);
        toast.success('Variable updated!');
      } else {
        await aiTemplateApi.addVariable(selectedTemplate.id, values);
        toast.success('Variable added!');
      }
      
      setShowVariableModal(false);
      setEditingVariable(null);
      fetchVariables(selectedTemplate.id);
    } catch (error) {
      toast.error('Failed to save variable');
    }
  };

  const handleDeleteVariable = async (id: number) => {
    if (window.confirm('Delete this variable?')) {
      try {
        await aiTemplateApi.deleteVariable(id);
        toast.success('Variable deleted!');
        if (selectedTemplate?.id) {
          fetchVariables(selectedTemplate.id);
        }
      } catch (error) {
        toast.error('Failed to delete variable');
      }
    }
  };

  // const insertVariableIntoBody = (variableName: string, setFieldValue: any, currentBody: string) => {
  //   const placeholder = `{${variableName}}`;
  //   setFieldValue('body', currentBody + placeholder);
  //   toast.success(`Variable ${placeholder} inserted!`);
  // };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      if (selectedTemplate) {
        await templateApi.updateTemplate(selectedTemplate.id, values);
        toast.success('Template updated!');
      } else {
        await templateApi.createTemplate(values);
        toast.success('Template created!');
      }
      setShowModal(false);
      setShowAIModal(false);
      resetForm();
      setSelectedTemplate(null);
      setGeneratedHtml('');
      setUploadedImage(null);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this template?')) {
      try {
        await templateApi.deleteTemplate(id);
        toast.success('Template deleted!');
        fetchTemplates();
      } catch (error) {
        toast.error('Failed to delete template');
      }
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Email Templates
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Create and manage email templates with AI assistance
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={() => {
              setSelectedTemplate(null);
              setShowAIModal(true);
            }}
          >
            AI Template
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedTemplate(null);
              setShowModal(true);
            }}
          >
            Create Template
          </Button>
        </Box>
      </Box>

      {/* Templates Grid */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        {templates.map((template) => (
          <Box
            key={template.id}
            sx={{
              width: 'calc(33.333% - 16px)',
              minWidth: 300,
            }}
          >
            <Card>
              <Typography variant="h6" fontWeight={600} mb={1}>
                {template.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2} noWrap>
                {template.subject}
              </Typography>
              <Box 
                sx={{ 
                  maxHeight: 100, 
                  overflow: 'hidden', 
                  mb: 2,
                  fontSize: 12,
                  color: 'text.secondary'
                }}
                dangerouslySetInnerHTML={{ __html: template.body.substring(0, 150) + '...' }}
              />
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button 
                  size="small" 
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowModal(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => handleValidateTemplate(template.subject, template.body)}
                >
                  Validate
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(template.id)}
                >
                  Delete
                </Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Regular Template Creation/Edit Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </Typography>
            <IconButton onClick={() => setShowModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              name: selectedTemplate?.name || '',
              subject: selectedTemplate?.subject || '',
              body: selectedTemplate?.body || '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3} mt={2}>
                  <TextField name="name" label="Template Name" />

                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={600}>
                        Subject Line
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={() => {
                          setActiveTab(0);
                          setShowSavedContent(true);
                        }}
                      >
                        Use Saved AI Content
                      </Button>
                    </Box>
                    <TextField name="subject" label="Email Subject" />
                  </Box>

                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={600}>
                        Email Body
                      </Typography>
                      <Box display="flex" gap={1}>
                        {selectedTemplate?.id && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Code />}
                            onClick={() => {
                              fetchVariables(selectedTemplate.id);
                              setShowVariables(true);
                            }}
                          >
                            Manage Variables ({variables.length})
                          </Button>
                        )}
                        <Button
                          size="small"
                          startIcon={<ContentCopy />}
                          onClick={() => {
                            setActiveTab(1);
                            setShowSavedContent(true);
                          }}
                        >
                          Use Saved Body
                        </Button>
                      </Box>
                    </Box>
                    <HtmlEditor
                      value={values.body}
                      onChange={(e) => setFieldValue('body', e.target.value)}
                      placeholder="Enter HTML content..."
                    />
                  </Box>

                  <Box display="flex" gap={2} justifyContent="space-between">
                    <Button
                      variant="outlined"
                      startIcon={<Security />}
                      onClick={() => handleValidateTemplate(values.subject, values.body)}
                    >
                      Validate & Check Spam
                    </Button>
                    <Box display="flex" gap={2}>
                      <Button onClick={() => setShowModal(false)}>Cancel</Button>
                      <Button
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                      >
                        {selectedTemplate ? 'Update' : 'Create'} Template
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* AI Template Creation Modal */}
      <Dialog open={showAIModal} onClose={() => setShowAIModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <AutoAwesome sx={{ color: '#A855F7' }} />
              <Typography variant="h6">AI Template Generator</Typography>
            </Box>
            <IconButton onClick={() => setShowAIModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              name: '',
              subject: '',
              body: generatedHtml,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3}>
                  <Alert severity="info">
                    Upload a design image (Canva export, PSD, screenshot) and AI will generate an HTML template
                  </Alert>

                  <UploadArea onClick={() => document.getElementById('image-upload')?.click()}>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setFieldValue)}
                    />
                    <CloudUpload sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
                    <Typography variant="h6" mb={1}>
                      {uploadedImage ? uploadedImage.name : 'Upload Template Design'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Drag & drop or click to upload (PNG, JPG, PSD)
                    </Typography>
                  </UploadArea>

                  <TextField name="name" label="Template Name" />

                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={600}>
                        Subject Line
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={() => setShowSavedContent(true)}
                      >
                        Use Saved AI Content
                      </Button>
                    </Box>
                    <TextField name="subject" label="Email Subject" />
                  </Box>

                  <Box>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                      <Tab label="HTML Editor" icon={<Code />} />
                      <Tab label="Preview" icon={<Preview />} />
                    </Tabs>

                    {activeTab === 0 && (
                      <HtmlEditor
                        value={values.body}
                        onChange={(e) => setFieldValue('body', e.target.value)}
                        placeholder="HTML content will appear here after image upload..."
                      />
                    )}

                    {activeTab === 1 && (
                      <Box
                        sx={{
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          borderRadius: 2,
                          p: 2,
                          minHeight: 400,
                          backgroundColor: 'white',
                        }}
                        dangerouslySetInnerHTML={{ __html: values.body }}
                      />
                    )}
                  </Box>

                  <Box display="flex" gap={2} justifyContent="space-between">
                    <Button
                      variant="outlined"
                      startIcon={<Security />}
                      onClick={() => handleValidateTemplate(values.subject, values.body)}
                    >
                      Validate & Check Spam
                    </Button>
                    <Box display="flex" gap={2}>
                      <Button onClick={() => setShowAIModal(false)}>Cancel</Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        loading={isSubmitting}
                      >
                        Save Template
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Saved AI Content Modal */}
      <Dialog open={showSavedContent} onClose={() => setShowSavedContent(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Saved AI Content</Typography>
            <IconButton onClick={() => setShowSavedContent(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab label={`Subjects (${savedSubjects.length})`} />
              <Tab label={`Bodies (${savedBodies.length})`} />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <List>
              {savedSubjects.length === 0 ? (
                <Alert severity="info">No saved subjects. Generate some in AI Content Generator!</Alert>
              ) : (
                savedSubjects.map((content) => (
                  <ListItem
                    key={content.id}
                    sx={{
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(168, 85, 247, 0.05)' },
                    }}
                  >
                    <ListItemText
                      primary={content.generatedContent}
                      secondary={`${content.tone} • Score: ${content.personalizationScore}`}
                    />
                    <IconButton onClick={() => {
                      navigator.clipboard.writeText(content.generatedContent);
                      toast.success('Copied to clipboard!');
                    }}>
                      <ContentCopy />
                    </IconButton>
                  </ListItem>
                ))
              )}
            </List>
          )}

          {activeTab === 1 && (
            <List>
              {savedBodies.length === 0 ? (
                <Alert severity="info">No saved bodies. Generate some in AI Content Generator!</Alert>
              ) : (
                savedBodies.map((content) => (
                  <ListItem
                    key={content.id}
                    sx={{
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(168, 85, 247, 0.05)' },
                    }}
                  >
                    <ListItemText
                      primary={content.generatedContent.substring(0, 100) + '...'}
                      secondary={`${content.tone} • Score: ${content.personalizationScore}`}
                    />
                    <IconButton onClick={() => {
                      navigator.clipboard.writeText(content.generatedContent);
                      toast.success('Copied to clipboard!');
                    }}>
                      <ContentCopy />
                    </IconButton>
                  </ListItem>
                ))
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Validation Results Modal */}
      <Dialog open={showValidation} onClose={() => setShowValidation(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Security sx={{ color: validation?.riskLevel === 'LOW' ? '#10B981' : '#EF4444' }} />
            <Typography variant="h6">Template Validation Results</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {validation && (
            <Box display="flex" flexDirection="column" gap={3}>
              <Card>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="textSecondary">
                    Spam Score
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: getRiskColor(validation.riskLevel) }}>
                    {validation.spamScore}
                  </Typography>
                </Box>
                <Chip
                  label={`Risk: ${validation.riskLevel}`}
                  sx={{
                    mt: 2,
                    backgroundColor: getRiskColor(validation.riskLevel),
                    color: 'white',
                  }}
                />
              </Card>

              {validation.spamIssues.length > 0 && (
                <Card>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Spam Issues Found ({validation.spamIssues.length})
                  </Typography>
                  <List>
                    {validation.spamIssues.map((issue: any, index: number) => (
                      <Box key={index}>
                        <ListItem>
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Warning sx={{ color: '#EF4444' }} />
                              <Typography variant="body1" fontWeight={600}>
                                {issue.keyword}
                              </Typography>
                              <Chip label={issue.severity} size="small" color="error" />
                              <Chip label={issue.location} size="small" variant="outlined" />
                            </Box>
                            <Typography variant="body2" color="textSecondary" mb={1}>
                              Context: {issue.context}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#10B981' }}>
                              💡 {issue.suggestion}
                            </Typography>
                          </Box>
                        </ListItem>
                        {index < validation.spamIssues.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </Card>
              )}

              {validation.recommendations.length > 0 && (
                <Card>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Recommendations
                  </Typography>
                  <List>
                    {validation.recommendations.map((rec: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${rec}`} />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}

              <Alert severity={validation.isValid ? 'success' : 'warning'}>
                {validation.isValid
                  ? 'Template looks good! Low spam risk.'
                  : 'Template needs improvement to avoid spam filters.'}
              </Alert>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Variables Management Modal */}
      <Dialog open={showVariables} onClose={() => setShowVariables(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Dynamic Variables</Typography>
            <Box display="flex" gap={1}>
              <Button
                size="small"
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingVariable(null);
                  setShowVariableModal(true);
                }}
              >
                Add Variable
              </Button>
              <IconButton onClick={() => setShowVariables(false)}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {variables.length === 0 ? (
            <Alert severity="info">
              No variables yet. Click "Add Variable" to create custom placeholders for your template.
            </Alert>
          ) : (
            <List>
              {variables.map((variable) => (
                <ListItem
                  key={variable.id}
                  sx={{
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip label={`{${variable.variableName}}`} color="primary" size="small" />
                      <Typography variant="body1" fontWeight={600}>
                        {variable.displayName}
                      </Typography>
                      {variable.isRequired && (
                        <Chip label="Required" size="small" color="error" />
                      )}
                      <Chip label={variable.dataType} size="small" variant="outlined" />
                    </Box>
                    {variable.description && (
                      <Typography variant="body2" color="textSecondary" mb={1}>
                        {variable.description}
                      </Typography>
                    )}
                    {variable.defaultValue && (
                      <Typography variant="caption" color="textSecondary">
                        Default: {variable.defaultValue}
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(`{${variable.variableName}}`);
                        toast.success('Variable copied!');
                      }}
                    >
                      <ContentCopy />
                    </IconButton>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingVariable(variable);
                        setShowVariableModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteVariable(variable.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Variable Creation/Edit Modal */}
      <Dialog open={showVariableModal} onClose={() => setShowVariableModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVariable ? 'Edit Variable' : 'Add Variable'}
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              variableName: editingVariable?.variableName || '',
              displayName: editingVariable?.displayName || '',
              defaultValue: editingVariable?.defaultValue || '',
              dataType: editingVariable?.dataType || 'STRING',
              isRequired: editingVariable?.isRequired || false,
              description: editingVariable?.description || '',
            }}
            onSubmit={handleAddVariable}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                  <TextField
                    name="variableName"
                    label="Variable Name (e.g., firstName)"
                    helperText="Use in template as {variableName}"
                  />
                  
                  <TextField
                    name="displayName"
                    label="Display Name"
                    helperText="Human-readable name"
                  />
                  
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={1}>
                      Data Type
                    </Typography>
                    <select
                      value={values.dataType}
                      onChange={(e) => setFieldValue('dataType', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        backgroundColor: '#1E293B',
                        color: '#E2E8F0',
                      }}
                    >
                      <option value="STRING">String</option>
                      <option value="NUMBER">Number</option>
                      <option value="DATE">Date</option>
                      <option value="EMAIL">Email</option>
                      <option value="URL">URL</option>
                    </select>
                  </Box>
                  
                  <TextField
                    name="defaultValue"
                    label="Default Value (Optional)"
                  />
                  
                  <TextField
                    name="description"
                    label="Description (Optional)"
                    multiline
                    rows={2}
                  />
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <input
                      type="checkbox"
                      checked={values.isRequired}
                      onChange={(e) => setFieldValue('isRequired', e.target.checked)}
                      style={{ width: 20, height: 20 }}
                    />
                    <Typography variant="body2">Required field</Typography>
                  </Box>

                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button onClick={() => setShowVariableModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      {editingVariable ? 'Update' : 'Add'} Variable
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

export default TemplatesEnhanced;
