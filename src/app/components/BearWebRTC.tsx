// src/app/components/BearWebRTC.tsx
import React, { useRef, useEffect, forwardRef } from "react";

interface BearWebRTCProps {
  onBearAction: (action: string) => void;
  listening: boolean;
  setListening: (val: boolean) => void;
  isConnecting: boolean;
  setIsConnecting: (val: boolean) => void;
}

export interface BearWebRTCHandle {
  toggleVoiceChat: () => Promise<void>;
}

const BearWebRTC = forwardRef<BearWebRTCHandle, BearWebRTCProps>(({
  onBearAction,
  listening,
  setListening,
  isConnecting,
  setIsConnecting,
}, ref) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in this browser');
      }

      // Get supported MIME types
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg'
      ].find(type => MediaRecorder.isTypeSupported(type));

      if (!mimeType) {
        throw new Error('No supported audio MIME types found');
      }

      console.log('Using MIME type:', mimeType);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Received audio chunk:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          if (audioChunksRef.current.length === 0) {
            throw new Error('No audio data recorded');
          }

          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log('Audio blob size:', audioBlob.size, 'bytes');

          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result as string;
              const base64Data = base64Audio.split(',')[1]; // Remove the data URL prefix

              console.log('Sending audio to API...');
              const response = await fetch('/api/realtime-session', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  audioData: base64Data,
                  mimeType: mimeType
                }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'Failed to process audio');
              }

              const { audioResponse, textResponse } = await response.json();
              console.log('Received response:', { textResponse });
              
              // Play the response audio
              if (audioResponse) {
                const audioBlob = new Blob([Buffer.from(audioResponse, 'base64')], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(audioBlob);
                if (audioElementRef.current) {
                  audioElementRef.current.src = audioUrl;
                  await audioElementRef.current.play();
                }
              }

              // Handle any bear actions from the response
              if (textResponse.toLowerCase().includes('play')) {
                onBearAction('play');
              } else if (textResponse.toLowerCase().includes('eat') || textResponse.toLowerCase().includes('food')) {
                onBearAction('feed');
              }
            } catch (error) {
              console.error('Error processing audio:', error);
              alert('Failed to process audio. Please try again.');
            }
          };

          reader.onerror = (error) => {
            console.error('Error reading audio file:', error);
            alert('Failed to process audio. Please try again.');
          };
        } catch (error) {
          console.error('Error in onstop handler:', error);
          alert('Failed to process audio. Please try again.');
        }
      };

      // Start recording with a 1-second timeslice
      mediaRecorder.start(1000);
      setListening(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(error instanceof Error ? error.message : 'Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setListening(false);
      console.log('Recording stopped');
    }
  };

  // Expose toggleVoiceChat for parent to call
  React.useImperativeHandle(ref, () => ({
    toggleVoiceChat: async () => {
      if (listening) {
        stopRecording();
      } else {
        await startRecording();
      }
    }
  }), [listening]);

  useEffect(() => {
    // Create audio element for playback
    const audioElement = document.createElement('audio');
    audioElement.autoplay = true;
    audioElementRef.current = audioElement;
    document.body.appendChild(audioElement);

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.remove();
      }
      stopRecording();
    };
  }, []);

  return (
    <>
      {isConnecting && (
        <div className="absolute top-4 left-4 bg-[#a8e6cf] text-white px-3 py-1 rounded-full text-sm animate-pulse z-10">
          Connecting...
        </div>
      )}
      {listening && !isConnecting && (
        <div className="absolute top-4 left-4 bg-[#a8e6cf] text-white px-3 py-1 rounded-full text-sm z-10">
          🎙️ Voice Chat Active
        </div>
      )}
    </>
  );
});

BearWebRTC.displayName = 'BearWebRTC';

export default BearWebRTC;