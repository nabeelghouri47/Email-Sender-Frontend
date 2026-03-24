import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Chip, Alert, Divider, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { Save, CheckCircle, Cancel, Psychology, Image } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import { toast } from 'react-toastify';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { aiProviderConfigApi } from '../api/endpoints';

const AIProviderSettings = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.roles?.includes('ROLE_ADMIN');
    } catch { return false; }
  });

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await aiProviderConfigApi.getMyConfig();
      setConfig(res.data);
    } catch {
      toast.error('Failed to load AI config');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      await aiProviderConfigApi.saveMyConfig(values);
      toast.success('AI provider settings saved');
      fetchConfig();
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const handleSaveGlobal = async (values: any) => {
    try {
      await aiProviderConfigApi.saveGlobalConfig(values);
      toast.success('Global AI settings saved');
    } catch {
      toast.error('Failed to save global settings');
    }
  };

  if (loading) return <Box sx={{ p: 3 }}><Typography>Loading...</Typography></Box>;

  const initialValues = {
    openaiApiKey: '',
    openaiModel: config?.openaiModel || 'gpt-4o',
    geminiApiKey: '',
    geminiModel: config?.geminiModel || 'gemini-2.0-flash-exp',
    claudeApiKey: '',
    claudeModel: config?.claudeModel || 'claude-3-5-sonnet-20241022',
    textProvider: config?.textProvider || 'OPENAI',
    imageProvider: config?.imageProvider || 'GEMINI_NANO',
    templateProvider: config?.templateProvider || 'CLAUDE',
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>AI Provider Settings</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Configure your OpenAI (GPT) and Google Gemini API keys. Keys are encrypted and stored securely.
      </Typography>

      {/* Status chips */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          icon={config?.hasOpenaiKey ? <CheckCircle /> : <Cancel />}
          label={`OpenAI: ${config?.hasOpenaiKey ? 'Configured (' + config.openaiApiKey + ')' : 'Not set'}`}
          color={config?.hasOpenaiKey ? 'success' : 'default'}
        />
        <Chip
          icon={config?.hasGeminiKey ? <CheckCircle /> : <Cancel />}
          label={`Gemini: ${config?.hasGeminiKey ? 'Configured (' + config.geminiApiKey + ')' : 'Not set'}`}
          color={config?.hasGeminiKey ? 'success' : 'default'}
        />
        <Chip
          icon={config?.hasClaudeKey ? <CheckCircle /> : <Cancel />}
          label={`Claude: ${config?.hasClaudeKey ? 'Configured (' + config.claudeApiKey + ')' : 'Not set'}`}
          color={config?.hasClaudeKey ? 'success' : 'default'}
        />
      </Box>

      <Formik initialValues={initialValues} onSubmit={handleSave} enableReinitialize>
        {({ values, setFieldValue }) => (
          <Form>
            <Grid container spacing={3}>

              {/* OpenAI Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  🤖 OpenAI (GPT) — Text Content
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Used for generating email content, subject lines, social posts, and CTAs.
                  Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">platform.openai.com</a>
                </Alert>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  name="openaiApiKey"
                  label="OpenAI API Key"
                  fullWidth
                  type="password"
                  placeholder={config?.hasOpenaiKey ? 'Leave blank to keep existing key' : 'sk-...'}
                  helperText={config?.hasOpenaiKey ? `Current: ${config.openaiApiKey}` : 'Paste your OpenAI API key'}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  name="openaiModel"
                  label="GPT Model"
                  select
                  fullWidth
                  SelectProps={{ native: true }}
                >
                  <option value="gpt-4o">GPT-4o (Recommended)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Cheapest)</option>
                </TextField>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Gemini Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  ✨ Google Gemini — Images (Nano)
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Used for generating images with Gemini Nano (Imagen 3) - best for social post images.
                  Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>
                </Alert>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  name="geminiApiKey"
                  label="Gemini API Key"
                  fullWidth
                  type="password"
                  placeholder={config?.hasGeminiKey ? 'Leave blank to keep existing key' : 'AIza...'}
                  helperText={config?.hasGeminiKey ? `Current: ${config.geminiApiKey}` : 'Paste your Google Gemini API key'}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  name="geminiModel"
                  label="Gemini Model"
                  select
                  fullWidth
                  SelectProps={{ native: true }}
                >
                  <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Recommended)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </TextField>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Claude Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  🧠 Claude (Anthropic) — Template Generation
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Used for generating HTML templates from images/designs - best for coding tasks.
                  Get your key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">Anthropic Console</a>
                </Alert>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  name="claudeApiKey"
                  label="Claude API Key"
                  fullWidth
                  type="password"
                  placeholder={config?.hasClaudeKey ? 'Leave blank to keep existing key' : 'sk-ant-...'}
                  helperText={config?.hasClaudeKey ? `Current: ${config.claudeApiKey}` : 'Paste your Claude API key'}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  name="claudeModel"
                  label="Claude Model"
                  select
                  fullWidth
                  SelectProps={{ native: true }}
                >
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku (Fastest)</option>
                </TextField>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Provider Selection */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Provider Routing</Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Psychology fontSize="small" /> Text Content
                </Typography>
                <ToggleButtonGroup
                  value={values.textProvider}
                  exclusive
                  onChange={(_, val) => val && setFieldValue('textProvider', val)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="OPENAI">GPT</ToggleButton>
                  <ToggleButton value="GEMINI">Gemini</ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                  For emails, posts, subject lines
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Image fontSize="small" /> Image Generation
                </Typography>
                <ToggleButtonGroup
                  value={values.imageProvider}
                  exclusive
                  onChange={(_, val) => val && setFieldValue('imageProvider', val)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="GEMINI_NANO">Gemini Nano</ToggleButton>
                  <ToggleButton value="OPENAI_DALLE">DALL-E</ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                  For social post images
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Psychology fontSize="small" /> Template from Image
                </Typography>
                <ToggleButtonGroup
                  value={values.templateProvider}
                  exclusive
                  onChange={(_, val) => val && setFieldValue('templateProvider', val)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="CLAUDE">Claude</ToggleButton>
                  <ToggleButton value="OPENAI">GPT</ToggleButton>
                  <ToggleButton value="GEMINI">Gemini</ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                  For HTML from PSD/Canva
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button type="submit" variant="contained" startIcon={<Save />}>
                    Save My Settings
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="outlined"
                      startIcon={<Save />}
                      onClick={() => handleSaveGlobal(values)}
                    >
                      Save as Global Default
                    </Button>
                  )}
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  "Save My Settings" applies only to your account. Admins can also set global defaults for all users.
                </Typography>
              </Grid>

            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AIProviderSettings;
