<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { Add, Block, CheckCircle, Lock, LockOpen } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { userApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  firstName: Yup.string(),
  lastName: Yup.string(),
  roles: Yup.array().min(1, 'At least one role is required'),
});

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await userApi.createUser(values);
      toast.success('User created successfully!');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: number, enabled: boolean) => {
    try {
      await userApi.toggleStatus(id, !enabled);
      toast.success(`User ${!enabled ? 'enabled' : 'disabled'}!`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleProfileEdit = async (id: number, canEdit: boolean) => {
    try {
      await userApi.toggleProfileEdit(id, !canEdit);
      toast.success(`Profile editing ${!canEdit ? 'unlocked' : 'locked'}!`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update permission');
    }
  };

  const columns = [
    { id: 'username', label: 'Username', minWidth: 150 },
    { id: 'email', label: 'Email', minWidth: 200 },
    {
      id: 'name',
      label: 'Name',
      minWidth: 150,
      format: (_: any, row: any) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
    },
    {
      id: 'roles',
      label: 'Roles',
      minWidth: 150,
      format: (value: string[]) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {value?.map((role: string) => (
            <Chip key={role} label={role.replace('ROLE_', '')} size="small" color="primary" />
          ))}
        </Box>
      ),
    },
    {
      id: 'enabled',
      label: 'Status',
      minWidth: 100,
      format: (value: boolean) => (
        <Chip label={value ? 'Enabled' : 'Disabled'} color={value ? 'success' : 'error'} size="small" />
      ),
    },
    {
      id: 'canEditProfile',
      label: 'Profile Edit',
      minWidth: 120,
      format: (value: boolean) => (
        <Chip label={value ? 'Allowed' : 'Locked'} color={value ? 'success' : 'warning'} size="small" />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      format: (_: any, row: any) => (
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            onClick={() => toggleStatus(row.id, row.enabled)}
            sx={{ color: row.enabled ? '#EF4444' : '#10B981' }}
            title={row.enabled ? 'Disable User' : 'Enable User'}
          >
            {row.enabled ? <Block /> : <CheckCircle />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => toggleProfileEdit(row.id, row.canEditProfile)}
            sx={{ color: row.canEditProfile ? '#F59E0B' : '#A855F7' }}
            title={row.canEditProfile ? 'Lock Profile' : 'Unlock Profile'}
          >
            {row.canEditProfile ? <LockOpen /> : <Lock />}
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            User Management
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
            New User
          </Button>
        </Box>

        <DataTable columns={columns} data={users} loading={loading} />

        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title="Create New User"
          maxWidth="sm"
        >
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              roles: ['ROLE_USER'],
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3}>
                  <TextField name="username" label="Username" />
                  <TextField name="email" label="Email" type="email" />
                  <TextField name="password" label="Password" type="password" />
                  <TextField name="firstName" label="First Name" />
                  <TextField name="lastName" label="Last Name" />
                  
                  <FormControl component="fieldset">
                    <FormLabel 
                      component="legend" 
                      sx={{ 
                        color: '#A855F7', 
                        fontWeight: 600,
                        mb: 1,
                        '&.Mui-focused': { color: '#A855F7' }
                      }}
                    >
                      Roles *
                    </FormLabel>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.roles.includes('ROLE_USER')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFieldValue('roles', [...values.roles, 'ROLE_USER']);
                              } else {
                                setFieldValue('roles', values.roles.filter((r: string) => r !== 'ROLE_USER'));
                              }
                            }}
                            sx={{
                              color: '#A855F7',
                              '&.Mui-checked': { color: '#A855F7' }
                            }}
                          />
                        }
                        label="User"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.roles.includes('ROLE_ADMIN')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFieldValue('roles', [...values.roles, 'ROLE_ADMIN']);
                              } else {
                                setFieldValue('roles', values.roles.filter((r: string) => r !== 'ROLE_ADMIN'));
                              }
                            }}
                            sx={{
                              color: '#A855F7',
                              '&.Mui-checked': { color: '#A855F7' }
                            }}
                          />
                        }
                        label="Admin"
                      />
                    </FormGroup>
                  </FormControl>

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      Create User
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Modal>
      </Box>
  );
};

export default Users;
=======
import { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { Add, Block, CheckCircle, Lock, LockOpen } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { userApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  firstName: Yup.string(),
  lastName: Yup.string(),
  roles: Yup.array().min(1, 'At least one role is required'),
});

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await userApi.createUser(values);
      toast.success('User created successfully!');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: number, enabled: boolean) => {
    try {
      await userApi.toggleStatus(id, !enabled);
      toast.success(`User ${!enabled ? 'enabled' : 'disabled'}!`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleProfileEdit = async (id: number, canEdit: boolean) => {
    try {
      await userApi.toggleProfileEdit(id, !canEdit);
      toast.success(`Profile editing ${!canEdit ? 'unlocked' : 'locked'}!`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update permission');
    }
  };

  const columns = [
    { id: 'username', label: 'Username', minWidth: 150 },
    { id: 'email', label: 'Email', minWidth: 200 },
    {
      id: 'name',
      label: 'Name',
      minWidth: 150,
      format: (_: any, row: any) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
    },
    {
      id: 'roles',
      label: 'Roles',
      minWidth: 150,
      format: (value: string[]) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {value?.map((role: string) => (
            <Chip key={role} label={role.replace('ROLE_', '')} size="small" color="primary" />
          ))}
        </Box>
      ),
    },
    {
      id: 'enabled',
      label: 'Status',
      minWidth: 100,
      format: (value: boolean) => (
        <Chip label={value ? 'Enabled' : 'Disabled'} color={value ? 'success' : 'error'} size="small" />
      ),
    },
    {
      id: 'canEditProfile',
      label: 'Profile Edit',
      minWidth: 120,
      format: (value: boolean) => (
        <Chip label={value ? 'Allowed' : 'Locked'} color={value ? 'success' : 'warning'} size="small" />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      format: (_: any, row: any) => (
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            onClick={() => toggleStatus(row.id, row.enabled)}
            sx={{ color: row.enabled ? '#EF4444' : '#10B981' }}
            title={row.enabled ? 'Disable User' : 'Enable User'}
          >
            {row.enabled ? <Block /> : <CheckCircle />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => toggleProfileEdit(row.id, row.canEditProfile)}
            sx={{ color: row.canEditProfile ? '#F59E0B' : '#A855F7' }}
            title={row.canEditProfile ? 'Lock Profile' : 'Unlock Profile'}
          >
            {row.canEditProfile ? <LockOpen /> : <Lock />}
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            User Management
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
            New User
          </Button>
        </Box>

        <DataTable columns={columns} data={users} loading={loading} />

        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title="Create New User"
          maxWidth="sm"
        >
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              roles: ['ROLE_USER'],
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={3}>
                  <TextField name="username" label="Username" />
                  <TextField name="email" label="Email" type="email" />
                  <TextField name="password" label="Password" type="password" />
                  <TextField name="firstName" label="First Name" />
                  <TextField name="lastName" label="Last Name" />
                  
                  <FormControl component="fieldset">
                    <FormLabel 
                      component="legend" 
                      sx={{ 
                        color: '#A855F7', 
                        fontWeight: 600,
                        mb: 1,
                        '&.Mui-focused': { color: '#A855F7' }
                      }}
                    >
                      Roles *
                    </FormLabel>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.roles.includes('ROLE_USER')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFieldValue('roles', [...values.roles, 'ROLE_USER']);
                              } else {
                                setFieldValue('roles', values.roles.filter((r: string) => r !== 'ROLE_USER'));
                              }
                            }}
                            sx={{
                              color: '#A855F7',
                              '&.Mui-checked': { color: '#A855F7' }
                            }}
                          />
                        }
                        label="User"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.roles.includes('ROLE_ADMIN')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFieldValue('roles', [...values.roles, 'ROLE_ADMIN']);
                              } else {
                                setFieldValue('roles', values.roles.filter((r: string) => r !== 'ROLE_ADMIN'));
                              }
                            }}
                            sx={{
                              color: '#A855F7',
                              '&.Mui-checked': { color: '#A855F7' }
                            }}
                          />
                        }
                        label="Admin"
                      />
                    </FormGroup>
                  </FormControl>

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      Create User
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Modal>
      </Box>
  );
};

export default Users;
>>>>>>> 5e525f2 (Frontend updated)
