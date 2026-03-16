<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Box, Typography, Grid, IconButton, Chip, Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider, Alert } from '@mui/material';
import { Edit, Delete, Add, Code, Preview, CloudUpload, Send, History } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { templateApi } from '../api/endpoints';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';

const TemplateCard = styled(Card)`
  && {
    height: 100%;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #A855F7 0%, #C084FC 100%);
    }
  }
`;

const TemplateBody = styled(Box)`
  background-color: rgba(30, 41, 59, 0.5);
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
  max-height: 150px;
  overflow: auto;
  font-family: monospace;
  font-size: 12px;
  color: #94A3B8;
  white-space: pre-wrap;
`;

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

const PreviewFrame = styled.iframe`
  width: 100%;
  min-height: 400px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 8px;
  background-color: white;
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

  input {
    display: none;
  }
`;

const validationSchema = Yup.object({
  name: Yup.string().required('Template name is required'),
  subject: Yup.string().required('Subject is required'),
  body: Yup.string().when('$htmlContent', {
    is: (htmlContent: string) => !htmlContent || htmlContent.length === 0,
    then: (schema) => schema.required('Body is required'),
    otherwise: (schema) => schema,
  }),
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const Templates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [htmlContent, setHtmlContent] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templateApi.getAllTemplates();
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/html' || file.name.endsWith('.html')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setHtmlContent(content);
          setFieldValue('body', content);
          setUploadedFileName(file.name);
          toast.success('HTML file uploaded!');
        };
        reader.readAsText(file);
      } else {
        toast.error('Please upload a valid HTML file');
      }
    }
  };

  const handlePreview = async (templateId: number) => {
    try {
      const response = await templateApi.previewTemplate(templateId, {
        firstName: 'John',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
      });
      setPreviewData(response.data);
      toast.success('Preview generated!');
    } catch (error) {
      toast.error('Failed to generate preview');
    }
  };

  const handleValidate = async (templateId: number) => {
    try {
      const response = await templateApi.validateTemplate(templateId);
      if (response.data.valid) {
        toast.success('Template is valid!');
        setValidationErrors([]);
      } else {
        setValidationErrors(response.data.errors);
        toast.warning('Template has validation errors');
      }
    } catch (error) {
      toast.error('Failed to validate template');
    }
  };

  const handleViewVersions = async (template: any) => {
    setSelectedTemplate(template);
    try {
      const response = await templateApi.getVersions(template.id);
      setVersions(response.data);
      setShowVersionsModal(true);
    } catch (error) {
      toast.error('Failed to fetch versions');
    }
  };

  const handleRevertVersion = async (versionNumber: number) => {
    if (!selectedTemplate) return;
    if (window.confirm(`Revert to version ${versionNumber}?`)) {
      try {
        await templateApi.revertToVersion(selectedTemplate.id, versionNumber);
        toast.success('Template reverted!');
        setShowVersionsModal(false);
        fetchTemplates();
      } catch (error) {
        toast.error('Failed to revert template');
      }
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const templateData = {
        ...values,
        body: htmlContent || values.body,
      };

      if (editingTemplate) {
        await templateApi.updateTemplate(editingTemplate.id, templateData);
        toast.success('Template updated!');
      } else {
        await templateApi.createTemplate(templateData);
        toast.success('Template created!');
      }
      handleCloseModal();
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setHtmlContent(template.body);
    setShowModal(true);
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

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setHtmlContent('');
    setUploadedFileName('');
    setTabValue(0);
    setPreviewData(null);
    setValidationErrors([]);
  };

  const handleSendTestEmail = async (values: any) => {
    try {
      await templateApi.sendTestEmail({
        templateId: selectedTemplate.id,
        recipientEmail: values.recipientEmail,
        variables: {
          firstName: values.firstName,
          name: values.name,
          email: values.email,
          phone: values.phone,
          company: values.company,
        },
      });
      toast.success('Test email sent!');
      setShowTestEmailModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send test email');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Email Templates
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
          New Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <TemplateCard>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {template.name}
                  </Typography>
                  <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                    <Chip
                      label={template.isActive ? 'Active' : 'Inactive'}
                      color={template.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={`v${template.version}`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(168, 85, 247, 0.2)' }}
                    />
                    {template.hasConditionalBlocks && (
                      <Chip label="Conditional" size="small" color="info" />
                    )}
                  </Box>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => handleEdit(template)} sx={{ color: '#A855F7' }}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(template.id)} sx={{ color: '#EF4444' }}>
                    <Delete />
                  </IconButton>
                </Box>
              </Box>

              <Typography variant="body2" color="textSecondary" mt={2}>
                <strong>Subject:</strong> {template.subject}
              </Typography>

              {template.variablesUsed && (
                <Box mt={1}>
                  <Typography variant="caption" color="textSecondary">
                    Variables: {template.variablesUsed}
                  </Typography>
                </Box>
              )}

              <TemplateBody>
                {template.body.substring(0, 200)}
                {template.body.length > 200 && '...'}
              </TemplateBody>

              <Box display="flex" gap={1} mt={2}>
                <Button
                  size="small"
                  startIcon={<Send />}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowTestEmailModal(true);
                  }}
                >
                  Test
                </Button>
                <Button
                  size="small"
                  startIcon={<History />}
                  onClick={() => handleViewVersions(template)}
                >
                  Versions
                </Button>
              </Box>
            </TemplateCard>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={showModal}
        onClose={handleCloseModal}
        title={editingTemplate ? 'Edit Template' : 'Create New Template'}
        maxWidth="lg"
      >
        <Formik
          initialValues={{
            name: editingTemplate?.name || '',
            subject: editingTemplate?.subject || '',
            body: editingTemplate?.body || '',
          }}
          validationSchema={validationSchema}
          context={{ htmlContent }}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField name="name" label="Template Name" />
                <TextField name="subject" label="Email Subject" placeholder="Use: {firstName}, {company}" />

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab icon={<CloudUpload />} label="Upload" />
                    <Tab icon={<Code />} label="Code" />
                    <Tab icon={<Preview />} label="Preview" />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  <UploadArea>
                    <input
                      type="file"
                      accept=".html"
                      onChange={(e) => handleFileUpload(e, setFieldValue)}
                      id="html-upload"
                    />
                    <label htmlFor="html-upload" style={{ cursor: 'pointer' }}>
                      <CloudUpload sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {uploadedFileName || 'Upload HTML File'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Click to browse
                      </Typography>
                      {uploadedFileName && (
                        <Chip label={`Uploaded: ${uploadedFileName}`} color="success" sx={{ mt: 2 }} />
                      )}
                    </label>
                  </UploadArea>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Variables:</strong> {'{firstName}'}, {'{name}'}, {'{email}'}, {'{phone}'}, {'{company}'}
                    <br />
                    <strong>Conditionals:</strong> {'{{if:field==value}}'}content{'{{endif}}'}
                  </Alert>
                  <HtmlEditor
                    value={htmlContent}
                    onChange={(e) => {
                      setHtmlContent(e.target.value);
                      setFieldValue('body', e.target.value);
                    }}
                    placeholder="<p>Hi {firstName},</p>"
                  />
                  {validationErrors.length > 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {validationErrors.map((error, idx) => (
                        <div key={idx}>{error}</div>
                      ))}
                    </Alert>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  {previewData ? (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        <strong>Subject:</strong> {previewData.subject}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <PreviewFrame srcDoc={previewData.previewHtml} title="Preview" />
                    </Box>
                  ) : (
                    <PreviewFrame
                      srcDoc={htmlContent || '<p style="text-align: center; color: #666;">No content</p>'}
                      title="Preview"
                    />
                  )}
                </TabPanel>

                <Box display="flex" gap={2} justifyContent="space-between">
                  <Box display="flex" gap={1}>
                    {editingTemplate && (
                      <>
                        <Button size="small" onClick={() => handlePreview(editingTemplate.id)}>
                          Preview
                        </Button>
                        <Button size="small" onClick={() => handleValidate(editingTemplate.id)}>
                          Validate
                        </Button>
                      </>
                    )}
                  </Box>
                  <Box display="flex" gap={2}>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      {editingTemplate ? 'Update' : 'Create'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>

      <Dialog open={showTestEmailModal} onClose={() => setShowTestEmailModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              recipientEmail: '',
              firstName: 'John',
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+1234567890',
              company: 'Acme Corp',
            }}
            onSubmit={handleSendTestEmail}
          >
            {({ isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                  <TextField name="recipientEmail" label="Send To" type="email" />
                  <Divider />
                  <Typography variant="subtitle2">Sample Data</Typography>
                  <TextField name="firstName" label="First Name" />
                  <TextField name="name" label="Full Name" />
                  <TextField name="email" label="Email" />
                  <TextField name="phone" label="Phone" />
                  <TextField name="company" label="Company" />
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button onClick={() => setShowTestEmailModal(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting} startIcon={<Send />}>
                      Send
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <Dialog open={showVersionsModal} onClose={() => setShowVersionsModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <History />
            <Typography variant="h6">Version History</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {versions.map((version, idx) => (
              <Box key={version.id}>
                <ListItem
                  secondaryAction={
                    <Button
                      size="small"
                      onClick={() => handleRevertVersion(version.versionNumber)}
                      disabled={version.versionNumber === selectedTemplate?.version}
                    >
                      {version.versionNumber === selectedTemplate?.version ? 'Current' : 'Revert'}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Version {version.versionNumber}
                        </Typography>
                        {version.versionNumber === selectedTemplate?.version && (
                          <Chip label="Current" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {version.changeDescription}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(version.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {idx < versions.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVersionsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Templates;
=======
import { useEffect, useState } from 'react';
import { Box, Typography, Grid, IconButton, Chip, Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider, Alert } from '@mui/material';
import { Edit, Delete, Add, Code, Preview, CloudUpload, Send, History } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { templateApi } from '../api/endpoints';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';

const TemplateCard = styled(Card)`
  && {
    height: 100%;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #A855F7 0%, #C084FC 100%);
    }
  }
`;

const TemplateBody = styled(Box)`
  background-color: rgba(30, 41, 59, 0.5);
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
  max-height: 150px;
  overflow: auto;
  font-family: monospace;
  font-size: 12px;
  color: #94A3B8;
  white-space: pre-wrap;
`;

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

const PreviewFrame = styled.iframe`
  width: 100%;
  min-height: 400px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 8px;
  background-color: white;
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

  input {
    display: none;
  }
`;

const validationSchema = Yup.object({
  name: Yup.string().required('Template name is required'),
  subject: Yup.string().required('Subject is required'),
  body: Yup.string().when('$htmlContent', {
    is: (htmlContent: string) => !htmlContent || htmlContent.length === 0,
    then: (schema) => schema.required('Body is required'),
    otherwise: (schema) => schema,
  }),
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const Templates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [htmlContent, setHtmlContent] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templateApi.getAllTemplates();
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/html' || file.name.endsWith('.html')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setHtmlContent(content);
          setFieldValue('body', content);
          setUploadedFileName(file.name);
          toast.success('HTML file uploaded!');
        };
        reader.readAsText(file);
      } else {
        toast.error('Please upload a valid HTML file');
      }
    }
  };

  const handlePreview = async (templateId: number) => {
    try {
      const response = await templateApi.previewTemplate(templateId, {
        firstName: 'John',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
      });
      setPreviewData(response.data);
      toast.success('Preview generated!');
    } catch (error) {
      toast.error('Failed to generate preview');
    }
  };

  const handleValidate = async (templateId: number) => {
    try {
      const response = await templateApi.validateTemplate(templateId);
      if (response.data.valid) {
        toast.success('Template is valid!');
        setValidationErrors([]);
      } else {
        setValidationErrors(response.data.errors);
        toast.warning('Template has validation errors');
      }
    } catch (error) {
      toast.error('Failed to validate template');
    }
  };

  const handleViewVersions = async (template: any) => {
    setSelectedTemplate(template);
    try {
      const response = await templateApi.getVersions(template.id);
      setVersions(response.data);
      setShowVersionsModal(true);
    } catch (error) {
      toast.error('Failed to fetch versions');
    }
  };

  const handleRevertVersion = async (versionNumber: number) => {
    if (!selectedTemplate) return;
    if (window.confirm(`Revert to version ${versionNumber}?`)) {
      try {
        await templateApi.revertToVersion(selectedTemplate.id, versionNumber);
        toast.success('Template reverted!');
        setShowVersionsModal(false);
        fetchTemplates();
      } catch (error) {
        toast.error('Failed to revert template');
      }
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const templateData = {
        ...values,
        body: htmlContent || values.body,
      };

      if (editingTemplate) {
        await templateApi.updateTemplate(editingTemplate.id, templateData);
        toast.success('Template updated!');
      } else {
        await templateApi.createTemplate(templateData);
        toast.success('Template created!');
      }
      handleCloseModal();
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setHtmlContent(template.body);
    setShowModal(true);
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

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setHtmlContent('');
    setUploadedFileName('');
    setTabValue(0);
    setPreviewData(null);
    setValidationErrors([]);
  };

  const handleSendTestEmail = async (values: any) => {
    try {
      await templateApi.sendTestEmail({
        templateId: selectedTemplate.id,
        recipientEmail: values.recipientEmail,
        variables: {
          firstName: values.firstName,
          name: values.name,
          email: values.email,
          phone: values.phone,
          company: values.company,
        },
      });
      toast.success('Test email sent!');
      setShowTestEmailModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send test email');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Email Templates
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
          New Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <TemplateCard>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {template.name}
                  </Typography>
                  <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                    <Chip
                      label={template.isActive ? 'Active' : 'Inactive'}
                      color={template.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={`v${template.version}`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(168, 85, 247, 0.2)' }}
                    />
                    {template.hasConditionalBlocks && (
                      <Chip label="Conditional" size="small" color="info" />
                    )}
                  </Box>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => handleEdit(template)} sx={{ color: '#A855F7' }}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(template.id)} sx={{ color: '#EF4444' }}>
                    <Delete />
                  </IconButton>
                </Box>
              </Box>

              <Typography variant="body2" color="textSecondary" mt={2}>
                <strong>Subject:</strong> {template.subject}
              </Typography>

              {template.variablesUsed && (
                <Box mt={1}>
                  <Typography variant="caption" color="textSecondary">
                    Variables: {template.variablesUsed}
                  </Typography>
                </Box>
              )}

              <TemplateBody>
                {template.body.substring(0, 200)}
                {template.body.length > 200 && '...'}
              </TemplateBody>

              <Box display="flex" gap={1} mt={2}>
                <Button
                  size="small"
                  startIcon={<Send />}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowTestEmailModal(true);
                  }}
                >
                  Test
                </Button>
                <Button
                  size="small"
                  startIcon={<History />}
                  onClick={() => handleViewVersions(template)}
                >
                  Versions
                </Button>
              </Box>
            </TemplateCard>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={showModal}
        onClose={handleCloseModal}
        title={editingTemplate ? 'Edit Template' : 'Create New Template'}
        maxWidth="lg"
      >
        <Formik
          initialValues={{
            name: editingTemplate?.name || '',
            subject: editingTemplate?.subject || '',
            body: editingTemplate?.body || '',
          }}
          validationSchema={validationSchema}
          context={{ htmlContent }}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField name="name" label="Template Name" />
                <TextField name="subject" label="Email Subject" placeholder="Use: {firstName}, {company}" />

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab icon={<CloudUpload />} label="Upload" />
                    <Tab icon={<Code />} label="Code" />
                    <Tab icon={<Preview />} label="Preview" />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  <UploadArea>
                    <input
                      type="file"
                      accept=".html"
                      onChange={(e) => handleFileUpload(e, setFieldValue)}
                      id="html-upload"
                    />
                    <label htmlFor="html-upload" style={{ cursor: 'pointer' }}>
                      <CloudUpload sx={{ fontSize: 64, color: '#A855F7', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {uploadedFileName || 'Upload HTML File'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Click to browse
                      </Typography>
                      {uploadedFileName && (
                        <Chip label={`Uploaded: ${uploadedFileName}`} color="success" sx={{ mt: 2 }} />
                      )}
                    </label>
                  </UploadArea>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Variables:</strong> {'{firstName}'}, {'{name}'}, {'{email}'}, {'{phone}'}, {'{company}'}
                    <br />
                    <strong>Conditionals:</strong> {'{{if:field==value}}'}content{'{{endif}}'}
                  </Alert>
                  <HtmlEditor
                    value={htmlContent}
                    onChange={(e) => {
                      setHtmlContent(e.target.value);
                      setFieldValue('body', e.target.value);
                    }}
                    placeholder="<p>Hi {firstName},</p>"
                  />
                  {validationErrors.length > 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {validationErrors.map((error, idx) => (
                        <div key={idx}>{error}</div>
                      ))}
                    </Alert>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  {previewData ? (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        <strong>Subject:</strong> {previewData.subject}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <PreviewFrame srcDoc={previewData.previewHtml} title="Preview" />
                    </Box>
                  ) : (
                    <PreviewFrame
                      srcDoc={htmlContent || '<p style="text-align: center; color: #666;">No content</p>'}
                      title="Preview"
                    />
                  )}
                </TabPanel>

                <Box display="flex" gap={2} justifyContent="space-between">
                  <Box display="flex" gap={1}>
                    {editingTemplate && (
                      <>
                        <Button size="small" onClick={() => handlePreview(editingTemplate.id)}>
                          Preview
                        </Button>
                        <Button size="small" onClick={() => handleValidate(editingTemplate.id)}>
                          Validate
                        </Button>
                      </>
                    )}
                  </Box>
                  <Box display="flex" gap={2}>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      {editingTemplate ? 'Update' : 'Create'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>

      <Dialog open={showTestEmailModal} onClose={() => setShowTestEmailModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              recipientEmail: '',
              firstName: 'John',
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+1234567890',
              company: 'Acme Corp',
            }}
            onSubmit={handleSendTestEmail}
          >
            {({ isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                  <TextField name="recipientEmail" label="Send To" type="email" />
                  <Divider />
                  <Typography variant="subtitle2">Sample Data</Typography>
                  <TextField name="firstName" label="First Name" />
                  <TextField name="name" label="Full Name" />
                  <TextField name="email" label="Email" />
                  <TextField name="phone" label="Phone" />
                  <TextField name="company" label="Company" />
                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button onClick={() => setShowTestEmailModal(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting} startIcon={<Send />}>
                      Send
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <Dialog open={showVersionsModal} onClose={() => setShowVersionsModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <History />
            <Typography variant="h6">Version History</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {versions.map((version, idx) => (
              <Box key={version.id}>
                <ListItem
                  secondaryAction={
                    <Button
                      size="small"
                      onClick={() => handleRevertVersion(version.versionNumber)}
                      disabled={version.versionNumber === selectedTemplate?.version}
                    >
                      {version.versionNumber === selectedTemplate?.version ? 'Current' : 'Revert'}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Version {version.versionNumber}
                        </Typography>
                        {version.versionNumber === selectedTemplate?.version && (
                          <Chip label="Current" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {version.changeDescription}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(version.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {idx < versions.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVersionsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Templates;
>>>>>>> 5e525f2 (Frontend updated)
