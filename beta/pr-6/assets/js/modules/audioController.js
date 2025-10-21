import { supabase } from "./supabaseClient.js";
import { ICONS } from "./constants.js";

let currentAudio = null;
let currentAudioCardData = null;

function resetCurrentAudioCard() {
  if (currentAudioCardData?.playPauseBtn) {
    currentAudioCardData.playPauseBtn.innerHTML = ICONS.PLAY;
  }
  if (currentAudioCardData?.progressBar) {
    currentAudioCardData.progressBar.value = currentAudioCardData.audio?.currentTime ?? 0;
  }
  currentAudio = null;
  currentAudioCardData = null;
}

function disableAudioControls(playPauseBtn, stopBtn, progressBar) {
  playPauseBtn.innerHTML = ICONS.AUDIO_UNAVAILABLE;
  playPauseBtn.disabled = true;
  stopBtn.disabled = true;
  progressBar.disabled = true;
}

export function attachAudioControls({ message, playPauseBtn, stopBtn, progressBar }) {
  if (!message.audio_path) {
    disableAudioControls(playPauseBtn, stopBtn, progressBar);
    return;
  }

  playPauseBtn.innerHTML = ICONS.PLAY;
  stopBtn.innerHTML = ICONS.STOP;

  let audioForThisCard = null;

  playPauseBtn.addEventListener('click', async () => {
    if (currentAudio && currentAudio !== audioForThisCard) {
      currentAudio.pause();
      resetCurrentAudioCard();
    }

    if (!audioForThisCard) {
      const rawKey = message.audio_path.trim().replace(/^\/?audio-files\//, '');
      const { data, error } = supabase.storage.from('audio-files').getPublicUrl(rawKey);
      if (error || !data.publicUrl) {
        console.error("Erreur getPublicUrl:", error);
        disableAudioControls(playPauseBtn, stopBtn, progressBar);
        alert("Impossible de charger l'audio.");
        return;
      }

      audioForThisCard = new Audio(data.publicUrl);
      currentAudio = audioForThisCard;
      currentAudioCardData = { playPauseBtn, progressBar, audio: audioForThisCard };

      audioForThisCard.addEventListener('loadedmetadata', () => {
        progressBar.max = audioForThisCard.duration;
      });

      audioForThisCard.addEventListener('timeupdate', () => {
        progressBar.value = audioForThisCard.currentTime;
      });

      audioForThisCard.addEventListener('ended', () => {
        playPauseBtn.innerHTML = ICONS.PLAY;
        if (currentAudio === audioForThisCard) {
          resetCurrentAudioCard();
        }
      });

      audioForThisCard.addEventListener('error', (event) => {
        console.error("Erreur de l'élément Audio:", event);
        disableAudioControls(playPauseBtn, stopBtn, progressBar);
        alert("Erreur de lecture audio.");
        if (currentAudio === audioForThisCard) {
          resetCurrentAudioCard();
        }
      });
    } else {
      currentAudio = audioForThisCard;
      currentAudioCardData = { playPauseBtn, progressBar, audio: audioForThisCard };
    }

    if (audioForThisCard.paused) {
      try {
        await audioForThisCard.play();
        playPauseBtn.innerHTML = ICONS.PAUSE;
      } catch (error) {
        console.error("Erreur au play():", error);
        playPauseBtn.innerHTML = ICONS.PLAY;
        alert("Erreur de lecture audio.");
      }
    } else {
      audioForThisCard.pause();
      playPauseBtn.innerHTML = ICONS.PLAY;
    }
  });

  stopBtn.addEventListener('click', () => {
    if (audioForThisCard) {
      audioForThisCard.pause();
      audioForThisCard.currentTime = 0;
      playPauseBtn.innerHTML = ICONS.PLAY;
      progressBar.value = 0;
      if (currentAudio === audioForThisCard) {
        resetCurrentAudioCard();
      }
    }
  });

  progressBar.addEventListener('input', () => {
    if (audioForThisCard) {
      audioForThisCard.currentTime = progressBar.value;
    }
  });
}
