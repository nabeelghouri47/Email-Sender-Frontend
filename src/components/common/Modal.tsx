import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import styled from 'styled-components';

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 16px;
    min-width: 500px;
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  && {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
    color: white;
    font-weight: 700;
  }
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ open, onClose, title, children, actions, maxWidth = 'sm' }: ModalProps) => {
  return (
    <StyledDialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <StyledDialogTitle>
        {title}
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </StyledDialogTitle>
      <DialogContent sx={{ mt: 2 }}>{children}</DialogContent>
      {actions && <DialogActions sx={{ p: 2 }}>{actions}</DialogActions>}
    </StyledDialog>
  );
};
