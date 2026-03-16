import { TextField as MuiTextField } from '@mui/material';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import { useField } from 'formik';
import styled from 'styled-components';

const StyledTextField = styled(MuiTextField)`
  && {
    .MuiOutlinedInput-root {
      border-radius: 8px;
      background-color: rgba(30, 41, 59, 0.5);
      
      &:hover fieldset {
        border-color: #A855F7;
      }
      
      &.Mui-focused fieldset {
        border-color: #A855F7;
      }
    }
  }
`;

interface FormikTextFieldProps extends Omit<MuiTextFieldProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  name: string;
}

export const TextField = ({ name, ...props }: FormikTextFieldProps) => {
  const [field, meta] = useField(name);
  
  return (
    <StyledTextField
      {...field}
      {...props}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      fullWidth
      value={field.value || ''}
    />
  );
};
