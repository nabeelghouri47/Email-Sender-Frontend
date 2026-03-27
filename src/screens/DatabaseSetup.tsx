import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Build as BuildIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import axios from '../api/axiosInstance';

export const DatabaseSetup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/database-fix/setup-multi-tenant');
      setResult(response.data);
    } catch (error: any) {
      setResult({ status: 'ERROR', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/database-fix/verify-setup');
      setVerification(response.data);
    } catch (error: any) {
      setVerification({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Database Setup Utility
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Setup multi-tenant architecture and create super admin
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 1: Setup Multi-Tenant Database
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will:
            <ul>
              <li>Create Super Admin user (username: superadmin, password: superadmin123)</li>
              <li>Create default tenant for existing admin</li>
              <li>Assign admin to default tenant</li>
              <li>Create tenant subscription</li>
            </ul>
          </Typography>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <BuildIcon />}
            onClick={handleSetup}
            disabled={loading}
          >
            Run Setup
          </Button>

          {result && (
            <Box sx={{ mt: 2 }}>
              <Alert severity={result.status === 'SUCCESS' ? 'success' : 'error'}>
                <Typography variant="subtitle2">Setup Result:</Typography>
                <pre style={{ fontSize: '12px', margin: '8px 0 0 0' }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 2: Verify Setup
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Check if everything is configured correctly
          </Typography>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
            onClick={handleVerify}
            disabled={loading}
          >
            Verify Setup
          </Button>

          {verification && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="subtitle2">Verification Result:</Typography>
                <pre style={{ fontSize: '12px', margin: '8px 0 0 0' }}>
                  {JSON.stringify(verification, null, 2)}
                </pre>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
        <Typography variant="subtitle2" gutterBottom>
          After Setup:
        </Typography>
        <Typography variant="body2">
          1. Logout from current session<br />
          2. Login as Super Admin (superadmin / superadmin123)<br />
          3. Go to Super Admin → Tenant Management<br />
          4. Create new client companies<br />
          5. Admin user will be in "default" tenant with Basic plan
        </Typography>
      </Paper>
    </Box>
  );
};
