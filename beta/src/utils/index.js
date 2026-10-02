import { KINE_COLORS, MESSAGE_TYPE_COLORS } from '../constants/index.jsx';

const DEFAULT_NON_ASSIGNE = 'Non assigné';
const DEFAULT_MESSAGE_TYPE = 'Autre';

const sanitizeForClass = (value = '') =>
  value.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }
  return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export const getKineStyle = (kineName) => {
  const baseValue = kineName || DEFAULT_NON_ASSIGNE;
  const sanitized = sanitizeForClass(baseValue);
  return {
    backgroundColor: KINE_COLORS[baseValue]?.select,
    className: sanitized ? `kine-${sanitized}` : undefined,
  };
};

export const getMessageTypeStyle = (typeName) => {
  const baseValue = typeName || DEFAULT_MESSAGE_TYPE;
  const sanitized = sanitizeForClass(baseValue);
  return {
    backgroundColor: MESSAGE_TYPE_COLORS[baseValue],
    className: sanitized ? `type-${sanitized}` : undefined,
  };
};

export const getCardClassByKine = (kineName) => {
  const sanitized = sanitizeForClass(kineName || '');
  return sanitized ? `card-kine-${sanitized}` : '';
};

export const getCardClassByType = (typeName) => {
  const sanitized = sanitizeForClass(typeName || '');
  return sanitized ? `card-type-${sanitized}` : '';
};

export const copyToClipboard = async (text) => {
  if (!navigator?.clipboard) {
    throw new Error('API Clipboard indisponible');
  }
  await navigator.clipboard.writeText(text);
};
