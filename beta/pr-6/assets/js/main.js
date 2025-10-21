import { supabase } from "./modules/supabaseClient.js";
import { populateFilters } from "./modules/filters.js";
import {
  initMessageList,
  showLoading,
  showError,
  setAllMessages,
  setFilters,
  render
} from "./modules/messageList.js";

document.addEventListener('DOMContentLoaded', () => {
  const filterKineElement = document.getElementById('filter-kine');
  const filterTypeElement = document.getElementById('filter-type');
  const listElement = document.getElementById('list');

  populateFilters(filterKineElement, filterTypeElement);
  initMessageList(listElement);
  setFilters({
    kine: filterKineElement.value,
    type: filterTypeElement.value
  });

  filterKineElement.addEventListener('change', () => {
    setFilters({ kine: filterKineElement.value });
    render();
  });

  filterTypeElement.addEventListener('change', () => {
    setFilters({ type: filterTypeElement.value });
    render();
  });

  fetchAndRenderMessages();
});

async function fetchAndRenderMessages() {
  showLoading();
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    setAllMessages(messages || []);
    render();
  } catch (error) {
    console.error('Erreur chargement messages:', error);
    showError(`Erreur de chargement des messages: ${error.message}`);
  }
}
