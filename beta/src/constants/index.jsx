import React from 'react';

export const SUPABASE_URL = 'https://xvxvhfpqyheelsdczxcj.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eHZoZnBxeWhlZWxzZGN6eGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDMzODUsImV4cCI6MjA2MjQ3OTM4NX0.Vj_0bATftrwhphgkPM3ii0DO4rSYp26Wy7TK30ZXzTY';

export const KINES = ['Johan', 'Damien', 'Simon', 'Justine', 'Charlotte', 'Florianne', 'Marine'];

export const KINE_COLORS = {
  Justine: { select: 'var(--kine-justine-bg)', card: 'var(--card-justine-bg)' },
  Charlotte: { select: 'var(--kine-charlotte-bg)', card: 'var(--card-charlotte-bg)' },
  Johan: { select: 'var(--kine-johan-bg)', card: 'var(--card-johan-bg)' },
  Simon: { select: 'var(--kine-simon-bg)', card: 'var(--card-simon-bg)' },
  Florianne: { select: 'var(--kine-florianne-bg)', card: 'var(--card-florianne-bg)' },
  Damien: { select: 'var(--kine-damien-bg)', card: 'var(--card-damien-bg)' },
  Marine: { select: 'var(--kine-marine-bg)', card: 'var(--card-marine-bg)' },
  'Non assigné': { select: 'var(--kine-non-assigne-bg)', card: 'var(--card-default-bg)' },
};

export const MESSAGE_TYPES = ['Demande RDV vestib', 'Demande RDV kiné', 'Annulation', 'Autre'];

export const MESSAGE_TYPE_COLORS = {
  'Demande RDV vestib': 'var(--type-rdv-vestib-bg)',
  'Demande RDV kiné': 'var(--type-rdv-kine-bg)',
  Annulation: 'var(--type-annulation-bg)',
  Autre: 'var(--type-autre-bg)',
};

const iconFactory = (path, viewBox = '0 0 24 24') =>
  React.memo(() => (
    <svg viewBox={viewBox} fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  ));

export const ICONS = {
  Play: iconFactory('M8 5v14l11-7z'),
  Pause: iconFactory('M6 19h4V5H6v14zm8-14v14h4V5h-4z'),
  Stop: iconFactory('M6 6h12v12H6z'),
  Delete: iconFactory('M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'),
  Copy: iconFactory('M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'),
  Copied: iconFactory('M9 16.17 4.83 12l-1.42 1.41L9 19l12-12-1.41-1.41z'),
  AudioUnavailable: iconFactory('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z'),
};
