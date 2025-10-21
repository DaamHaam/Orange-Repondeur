import { supabase } from "./supabaseClient.js";
import { KINES, MESSAGE_TYPES, ICONS } from "./constants.js";
import { formatDate, styleSelectByValue, styleCardByKine, copyToClipboard } from "./utils.js";
import { attachAudioControls } from "./audioController.js";

export function createMessageCard(message, { onDeleteSuccess } = {}) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = message.id;
  styleCardByKine(card, message.prenom_kine);

  const meta = document.createElement('div');
  meta.className = 'meta';

  const dateDiv = document.createElement('div');
  dateDiv.className = 'date';
  dateDiv.textContent = formatDate(message.date);
  meta.appendChild(dateDiv);

  const phoneDiv = document.createElement('div');
  phoneDiv.className = 'phone';
  const phoneSpan = document.createElement('span');
  phoneSpan.textContent = message.phone;
  phoneDiv.appendChild(phoneSpan);
  const copyPhoneBtn = document.createElement('button');
  copyPhoneBtn.className = 'copy-icon';
  copyPhoneBtn.title = 'Copier numéro';
  copyPhoneBtn.innerHTML = ICONS.COPY;
  copyPhoneBtn.addEventListener('click', () => copyToClipboard(message.phone, copyPhoneBtn));
  phoneDiv.appendChild(copyPhoneBtn);
  meta.appendChild(phoneDiv);

  if (message.name) {
    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = message.name;
    meta.appendChild(nameDiv);
  }

  if (message.email) {
    const emailDiv = document.createElement('div');
    emailDiv.className = 'email';
    emailDiv.textContent = message.email;
    meta.appendChild(emailDiv);
  }

  const kineSelect = document.createElement('select');
  kineSelect.className = 'select-kine';
  const defaultKineOption = document.createElement('option');
  defaultKineOption.value = '';
  defaultKineOption.textContent = 'Kiné non assigné';
  kineSelect.appendChild(defaultKineOption);

  KINES.forEach(kine => {
    const option = document.createElement('option');
    option.value = kine;
    option.textContent = kine;
    kineSelect.appendChild(option);
  });

  kineSelect.value = message.prenom_kine || '';
  styleSelectByValue(kineSelect, kineSelect.value, 'kine');
  kineSelect.addEventListener('change', async (event) => {
    const newKine = event.target.value || null;
    const { error } = await supabase
      .from('messages')
      .update({ prenom_kine: newKine })
      .eq('id', message.id);

    if (error) {
      console.error('Erreur MAJ kiné:', error);
      alert(`Erreur mise à jour kiné: ${error.message}`);
      event.target.value = message.prenom_kine || '';
    } else {
      message.prenom_kine = newKine;
      styleSelectByValue(kineSelect, newKine, 'kine');
      styleCardByKine(card, newKine);
    }
  });
  meta.appendChild(kineSelect);

  const typeSelect = document.createElement('select');
  typeSelect.className = 'select-type';
  MESSAGE_TYPES.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    if ((type === 'Autre' && !message.message_type) || message.message_type === type) {
      option.selected = true;
    }
    typeSelect.appendChild(option);
  });

  typeSelect.value = message.message_type || 'Autre';
  styleSelectByValue(typeSelect, typeSelect.value, 'messageType');
  typeSelect.addEventListener('change', async (event) => {
    const newType = event.target.value;
    const { error } = await supabase
      .from('messages')
      .update({ message_type: newType })
      .eq('id', message.id);

    if (error) {
      console.error('Erreur MAJ type:', error);
      alert(`Erreur mise à jour type: ${error.message}`);
      event.target.value = message.message_type || 'Autre';
    } else {
      message.message_type = newType;
      styleSelectByValue(typeSelect, newType, 'messageType');
    }
  });
  meta.appendChild(typeSelect);
  card.appendChild(meta);

  const mainContent = document.createElement('div');
  mainContent.className = 'main-content';

  const transcriptDiv = document.createElement('div');
  transcriptDiv.className = 'transcript';
  transcriptDiv.innerHTML = message.transcript
    ? message.transcript.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    : '<em>Pas de transcription.</em>';
  mainContent.appendChild(transcriptDiv);

  const summaryLine = document.createElement('div');
  summaryLine.className = 'summary-line';

  const summaryText = document.createElement('span');
  summaryText.className = 'text';
  let summaryContent = message.phone;
  if (message.name) {
    summaryContent += ` ${message.name}`;
  }
  summaryContent += ` – ${message.resume || 'Pas de résumé.'}`;
  summaryText.textContent = summaryContent;
  summaryLine.appendChild(summaryText);

  const copySummaryBtn = document.createElement('button');
  copySummaryBtn.className = 'copy-icon';
  copySummaryBtn.title = 'Copier infos + résumé';
  copySummaryBtn.innerHTML = ICONS.COPY;
  copySummaryBtn.addEventListener('click', () => copyToClipboard(summaryText.textContent, copySummaryBtn));
  summaryLine.appendChild(copySummaryBtn);

  mainContent.appendChild(summaryLine);
  card.appendChild(mainContent);

  const actions = document.createElement('div');
  actions.className = 'actions';

  const audioControlsDiv = document.createElement('div');
  audioControlsDiv.className = 'audio-controls';

  const playPauseBtn = document.createElement('button');
  playPauseBtn.innerHTML = ICONS.PLAY;
  playPauseBtn.title = message.audio_path ? 'Lire/Pause' : 'Audio indisponible';

  const stopBtn = document.createElement('button');
  stopBtn.innerHTML = ICONS.STOP;
  stopBtn.title = 'Arrêter';

  audioControlsDiv.appendChild(playPauseBtn);
  audioControlsDiv.appendChild(stopBtn);
  actions.appendChild(audioControlsDiv);

  const progressBar = document.createElement('input');
  progressBar.type = 'range';
  progressBar.className = 'progress-bar';
  progressBar.value = 0;
  progressBar.max = 100;
  actions.appendChild(progressBar);

  attachAudioControls({ message, playPauseBtn, stopBtn, progressBar });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = ICONS.DELETE;
  deleteBtn.title = 'Supprimer message';

  deleteBtn.addEventListener('click', async () => {
    const messageIdToDelete = message.id;
    const audioPathToDelete = message.audio_path;

    console.log(`Tentative de suppression du message ID: ${messageIdToDelete}`);
    if (audioPathToDelete) {
      console.log(`Avec audio_path: ${audioPathToDelete}`);
    }

    try {
      const { error: dbError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageIdToDelete);

      if (dbError) {
        console.error('Erreur suppression DB:', dbError);
        throw new Error(`Échec de la suppression du message (ID: ${messageIdToDelete}) de la base de données: ${dbError.message}`);
      }

      console.log(`Message ID ${messageIdToDelete} supprimé de la DB avec succès.`);
      card.remove();

      if (audioPathToDelete) {
        const rawKey = audioPathToDelete.trim().replace(/^\/?audio-files\//, '');
        console.log(`Tentative de suppression du fichier audio avec rawKey: '${rawKey}' (bucket 'audio-files')`);

        if (rawKey) {
          const { data: removeData, error: storageError } = await supabase
            .storage
            .from('audio-files')
            .remove([rawKey]);

          if (storageError) {
            console.error(`ERREUR lors de la suppression du fichier audio '${rawKey}':`, storageError);
            alert(`Le message a été supprimé de la base de données, mais une ERREUR est survenue lors de la tentative de suppression du fichier audio associé: ${storageError.message}.\nVérifiez la console et vos politiques RLS sur le bucket 'audio-files'.`);
          } else {
            console.log(`Supabase API call pour supprimer '${rawKey}' terminée. Réponse data:`, removeData);
          }
        } else {
          console.warn(`rawKey est vide pour audio_path '${audioPathToDelete}' après nettoyage. Suppression du fichier audio ignorée.`);
        }
      } else {
        console.log('Aucun audio_path associé à ce message, suppression de fichier ignorée.');
      }

      if (typeof onDeleteSuccess === 'function') {
        onDeleteSuccess(messageIdToDelete);
      }
    } catch (error) {
      console.error(`Erreur globale lors de la suppression du message ID ${messageIdToDelete}:`, error);
      alert(`Erreur lors de la suppression : ${error.message}\nLe message n'a peut-être pas été supprimé. Veuillez vérifier la console et actualiser.`);
    }
  });

  actions.appendChild(deleteBtn);
  card.appendChild(actions);

  return card;
}
