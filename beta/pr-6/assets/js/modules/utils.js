import { KINE_COLORS, MESSAGE_TYPE_COLORS, ICONS } from "./constants.js";

const DEFAULT_NON_ASSIGNE = "Non assigné";
const DEFAULT_MESSAGE_TYPE = "Autre";

function sanitizeForClass(value) {
  return value.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

export function styleSelectByValue(selectElement, value, typeContext) {
  const classList = [...selectElement.classList];
  classList.forEach(cls => {
    if (cls.startsWith('type-') || cls.startsWith('kine-')) {
      selectElement.classList.remove(cls);
    }
  });

  let color;
  let classNamePrefix;
  let baseValue;

  if (typeContext === 'kine') {
    baseValue = value || DEFAULT_NON_ASSIGNE;
    color = KINE_COLORS[baseValue]?.select;
    classNamePrefix = 'kine-';
  } else if (typeContext === 'messageType') {
    baseValue = value || DEFAULT_MESSAGE_TYPE;
    color = MESSAGE_TYPE_COLORS[baseValue];
    classNamePrefix = 'type-';
  }

  if (color) {
    selectElement.style.backgroundColor = color;
    const sanitizedValue = sanitizeForClass(baseValue);
    if (sanitizedValue) {
      selectElement.classList.add(`${classNamePrefix}${sanitizedValue}`);
    }
  } else {
    selectElement.style.backgroundColor = '';
  }
}

export function styleCardByKine(cardElement, kineName) {
  const classList = [...cardElement.classList];
  classList.forEach(cls => {
    if (cls.startsWith('card-kine-')) {
      cardElement.classList.remove(cls);
    }
  });

  cardElement.style.backgroundColor = '';
  const kineKey = kineName || DEFAULT_NON_ASSIGNE;
  const suffix = kineKey !== DEFAULT_NON_ASSIGNE ? sanitizeForClass(kineKey) : null;

  if (suffix) {
    cardElement.classList.add(`card-kine-${suffix}`);
  } else {
    cardElement.style.backgroundColor = KINE_COLORS[DEFAULT_NON_ASSIGNE].card;
  }
}

export async function copyToClipboard(text, buttonElement) {
  try {
    const originalIcon = buttonElement.innerHTML;
    await navigator.clipboard.writeText(text);
    buttonElement.innerHTML = ICONS.COPIED;
    setTimeout(() => {
      buttonElement.innerHTML = originalIcon;
    }, 1500);
  } catch (error) {
    console.error('Failed to copy: ', error);
    alert('Erreur lors de la copie.');
  }
}
