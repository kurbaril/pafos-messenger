import React, { useState, useRef, useEffect } from 'react';
import { uploadVoice } from '../api';
import toast from 'react-hot-toast';

export default function VoiceRecorder({ onSend, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) { // Max 2 minutes
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    setAudioURL(null);
    audioChunksRef.current = [];
  };

  const sendRecording = async () => {
    if (!audioURL) return;
    
    setUploading(true);
    try {
      const blob = await fetch(audioURL).then(r => r.blob());
      const file = new File([blob], 'voice.webm', { type: 'audio/webm' });
      const result = await uploadVoice(file);
      
      onSend({
        type: 'voice',
        url: result.url,
        duration: recordingTime,
        size: result.size
      });
      
      setAudioURL(null);
      audioChunksRef.current = [];
      toast.success('Voice message sent');
    } catch (error) {
      toast.error('Failed to send voice message');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (disabled) return null;

  return (
    <div className="relative">
      {!isRecording && !audioURL && (
        <button
          onClick={startRecording}
          className="p-2 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-full transition-all"
          title="Voice message"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}

      {isRecording && (
        <div className="absolute bottom-full left-0 mb-2 p-3 bg-surface border border-border rounded-xl shadow-lg flex items-center gap-3 animate-fadeInUp">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-500">REC</span>
          </div>
          <span className="text-text font-mono">{formatTime(recordingTime)}</span>
          <button
            onClick={stopRecording}
            className="px-3 py-1 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg transition-colors"
          >
            Stop
          </button>
          <button
            onClick={cancelRecording}
            className="p-1 text-text-secondary hover:text-error rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {audioURL && !isRecording && (
        <div className="absolute bottom-full left-0 mb-2 p-3 bg-surface border border-border rounded-xl shadow-lg flex items-center gap-3 animate-fadeInUp">
          <audio src={audioURL} controls className="h-8 w-40" />
          <span className="text-text-secondary text-sm">{formatTime(recordingTime)}</span>
          <button
            onClick={sendRecording}
            disabled={uploading}
            className="p-1 text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
          <button
            onClick={cancelRecording}
            className="p-1 text-text-secondary hover:text-error rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}