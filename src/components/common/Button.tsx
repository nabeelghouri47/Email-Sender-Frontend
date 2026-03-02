import { Button as MuiButton, CircularProgress } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';
import styled from 'styled-components';

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
}

const StyledButton = styled(MuiButton)`
  && {
    text-transform: none;
    font-weight: 600;
    border-radius: 8px;
    padding: 10px 24px;
    box-shadow: 0 2px 4px rgba(168, 85, 247, 0.2);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 8px rgba(168, 85, 247, 0.3);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.6;
    }
  }
`;

export const Button = ({ loading, children, disabled, ...props }: ButtonProps) => {
  return (
    <StyledButton disabled={disabled || loading} {...props}>
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </StyledButton>
  );
};
