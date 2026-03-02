import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, Paper } from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import styled from 'styled-components';
import { loginRequest } from '../actions/authActions';
import { type RootState } from '../redux/reducer/rootReducer';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { useEffect } from 'react';

const LoginContainer = styled(Box)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0F172A;
  padding: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
    top: -250px;
    left: -250px;
    animation: pulse 4s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%);
    bottom: -250px;
    right: -250px;
    animation: pulse 4s ease-in-out infinite 2s;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }
`;

const LoginPaper = styled(Paper)`
  && {
    padding: 48px;
    border-radius: 24px;
    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    border: 1px solid rgba(168, 85, 247, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 450px;
    width: 100%;
    position: relative;
    z-index: 1;
  }
`;

const Logo = styled(Box)`
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #A855F7 0%, #C084FC 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 8px 0;
  }

  p {
    color: #94A3B8;
    font-size: 14px;
    margin: 0;
  }
`;

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (values: { username: string; password: string }) => {
    dispatch(loginRequest(values));
  };

  return (
    <LoginContainer>
      <LoginPaper elevation={24}>
        <Logo>
          <h1>Email Sender</h1>
          <p>Marketing Automation Platform</p>
        </Logo>

        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form>
              <Box mb={3}>
                <TextField
                  name="username"
                  label="Username"
                  placeholder="Enter your username"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: '#A855F7' }} />,
                  }}
                />
              </Box>

              <Box mb={3}>
                <TextField
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: '#A855F7' }} />,
                  }}
                />
              </Box>

              {error && (
                <Typography color="error" variant="body2" mb={2} textAlign="center">
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                loading={loading}
                size="large"
              >
                Sign In
              </Button>

              <Box mt={3} textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  Default: admin / admin123
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </LoginPaper>
    </LoginContainer>
  );
};

export default Login;
