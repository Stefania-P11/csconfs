import React, { useEffect, useState } from 'react';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';

const StyledLink = styled(Link)({
  color: 'darkblue',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const calculateCountdown = (deadline) => {
  if (!deadline) return '';
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate - now;
  if (diff <= 0) return 'Deadline passed';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if ([days, hours, minutes, seconds].some(isNaN)) return '';

  // return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
  return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};

const ConferenceCard = ({ conference }) => {
  const [countdown, setCountdown] = useState(calculateCountdown(conference.deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(conference.deadline));
    }, 1000);
    return () => clearInterval(interval);
  });

  // Format date range or fallback
  const dateRangeDisplay = conference.date 
    ? new Date(conference.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : 'TBD';
  const deadlineDisplay = conference.deadline
    ? new Date(conference.deadline).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : 'TBD'; // example fallback text from screenshot

  const notificationDateDisplay = conference.notification_date
  ? new Date(conference.notification_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  : 'TBD'; // example fallback text from screenshot

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '5px',
        
        padding: 1,
        marginBottom: 2, 
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 100,
      }}
    >
      {/* Left column: name, description, area */}
      <CardContent sx={{ flexBasis: '50%', padding: 0, }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          <StyledLink href={conference.link} target="_blank" rel="noopener noreferrer">
            {conference.name} {conference.year}
          </StyledLink>
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 0., color: 'text.secondary', fontSize: 'var(--font-size-body)' }}>
          {conference.description}
        </Typography>
        
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'error.main', fontSize: 'var(--font-size-body)' }}>
          {conference.note}
        </Typography>
      </CardContent>

      {/* Center column: date range and location */}
      <CardContent
        sx={{
          flexBasis: '25%',
          textAlign: 'right',
          color: 'text.black',
          fontWeight: 'medium',
          fontSize: 'var(--font-size-body)',
          padding: 0,
        }}
      >
        <Typography sx={{ fontSize: 'var(--font-size-body)' }}>
          {dateRangeDisplay}
        </Typography>
        {conference.place}
      </CardContent>

      {/* Right column: countdown and deadline */}
      <CardContent 
        sx={{ 
          flexBasis: '35%', 
          textAlign: 'right',
          paddingRight: 0,
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="error.main" sx={{ fontSize: 'var(--font-size-title)' }}>
          {countdown || 'TBD'}
        </Typography>
        <Typography fontWeight="bold" sx={{ fontSize: 'var(--font-size-body)' }}>
          Deadline: {deadlineDisplay}
        </Typography>
        <Typography sx={{ fontSize: 'var(--font-size-body)' }}>
          Notification: {notificationDateDisplay}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ConferenceCard;