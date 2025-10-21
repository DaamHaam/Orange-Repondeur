import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';

function normaliseAudioKey(audioPath) {
  if (!audioPath) return null;
  return audioPath.trim().replace(/^\/?audio-files\//, '');
}

export default function useSupabaseMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .order('date', { ascending: false });

    if (fetchError) {
      setError(fetchError);
      setMessages([]);
    } else {
      setMessages(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const updateMessage = useCallback(async (id, updates) => {
    const { error: updateError } = await supabase.from('messages').update(updates).eq('id', id);
    if (updateError) {
      throw updateError;
    }
    setMessages((previous) =>
      previous.map((message) => (message.id === id ? { ...message, ...updates } : message))
    );
  }, []);

  const deleteMessage = useCallback(async (message) => {
    const { error: dbError } = await supabase.from('messages').delete().eq('id', message.id);
    if (dbError) {
      throw dbError;
    }

    setMessages((previous) => previous.filter((current) => current.id !== message.id));

    let storageError = null;
    const audioKey = normaliseAudioKey(message.audio_path);
    if (audioKey) {
      const { error: removeError } = await supabase.storage.from('audio-files').remove([audioKey]);
      if (removeError) {
        storageError = removeError;
      }
    }

    return { storageError };
  }, []);

  return { messages, loading, error, updateMessage, deleteMessage };
}
