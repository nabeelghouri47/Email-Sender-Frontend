import { Card as MuiCard, CardContent, CardActions, Typography } from '@mui/material';
import styled from 'styled-components';

const StyledCard = styled(MuiCard)`
  && {
    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    border: 1px solid rgba(168, 85, 247, 0.1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 12px -1px rgba(168, 85, 247, 0.2);
      border-color: rgba(168, 85, 247, 0.3);
    }
  }
`;

interface CardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Card = ({ title, children, actions }: CardProps) => {
  return (
    <StyledCard>
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom sx={{ color: '#A855F7', fontWeight: 600 }}>
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </StyledCard>
  );
};
