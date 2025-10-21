import { createMessageCard } from "./cardFactory.js";

let listElement = null;
let allMessages = [];
let filters = {
  kine: '',
  type: ''
};

export function initMessageList(element) {
  listElement = element;
}

export function showLoading() {
  if (!listElement) return;
  listElement.innerHTML = '<p>Chargement des messages...</p>';
}

export function showError(message) {
  if (!listElement) return;
  listElement.innerHTML = `<p>${message}</p>`;
}

export function setAllMessages(messages = []) {
  allMessages = Array.isArray(messages) ? [...messages] : [];
}

export function setFilters(newFilters = {}) {
  filters = { ...filters, ...newFilters };
}

export function getAllMessages() {
  return [...allMessages];
}

function applyFilters(messages) {
  return messages.filter(message => {
    const matchesKine = !filters.kine
      || (filters.kine === 'Non assigné' ? !message.prenom_kine : message.prenom_kine === filters.kine);
    const matchesType = !filters.type || message.message_type === filters.type;
    return matchesKine && matchesType;
  });
}

export function render() {
  if (!listElement) {
    return;
  }

  if (!allMessages.length) {
    listElement.innerHTML = '<p>Aucun message pour le moment.</p>';
    return;
  }

  const filteredMessages = applyFilters(allMessages);

  if (!filteredMessages.length) {
    listElement.innerHTML = '<p>Aucun message ne correspond à vos filtres.</p>';
    return;
  }

  listElement.innerHTML = '';
  const sortedMessages = [...filteredMessages].sort((a, b) => new Date(b.date) - new Date(a.date));

  sortedMessages.forEach(message => {
    const card = createMessageCard(message, {
      onDeleteSuccess: removeMessageById
    });
    listElement.appendChild(card);
  });
}

export function removeMessageById(id) {
  allMessages = allMessages.filter(message => message.id !== id);
  if (!allMessages.length) {
    listElement.innerHTML = '<p>Aucun message pour le moment.</p>';
  } else {
    render();
  }
}
