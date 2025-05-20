// src/app/components/BearWebRTC.tsx
import React, { useRef } from "react";

interface BearWebRTCProps {
  onBearAction: (action: string) => void;
  listening: boolean;
  setListening: (val: boolean) => void;
  isConnecting: boolean;
  setIsConnecting: (val: boolean) => void;
}

const BearWebRTC: React.FC<BearWebRTCProps> = ({
  onBearAction,
  listening,
  setListening,
  isConnecting,
  setIsConnecting,
}) => {
  // --- All refs and state from Bear.tsx ---
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // --- Handlers from Bear.tsx ---
  const handleDataChannelMessage = (event: MessageEvent) => {
    try {
      const serverEvent = JSON.parse(event.data);
      switch (serverEvent.type) {
        case 'session.created':
          break;
        case 'input_audio_buffer.speech_started':
          break;
        case 'input_audio_buffer.speech_stopped':
          break;
        case 'response.function_call_arguments.delta':
          if (serverEvent.delta.name === 'bear_action') {
            const args = JSON.parse(serverEvent.delta.arguments);
            onBearAction(args.action);
          }
          break;
        case 'error':
          console.error('Server error:', serverEvent);
          break;
      }
    } catch (error) {
      console.error('Error handling data channel message:', error);
    }
  };

  const initializeWebRTC = async () => {
    try {
      setIsConnecting(true);

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ]
      });
      peerConnectionRef.current = pc;

      pc.oniceconnectionstatechange = () => {
        // console.log('ICE Connection State:', pc.iceConnectionState);
      };
      pc.onsignalingstatechange = () => {
        // console.log('Signaling State:', pc.signalingState);
      };
      pc.onicecandidate = (event) => {
        // console.log('ICE Candidate:', event.candidate);
      };

      const dataChannel = pc.createDataChannel('events', { ordered: true });
      dataChannel.onopen = () => {};
      dataChannel.onclose = () => {};
      dataChannel.onerror = (error) => { console.error('Data channel error:', error); };
      dataChannel.onmessage = handleDataChannelMessage;
      dataChannelRef.current = dataChannel;

      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;
      document.body.appendChild(audioEl);

      pc.ontrack = (event) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = event.streams[0];
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      stream.getTracks().forEach(track => {
        if (mediaStreamRef.current) {
          pc.addTrack(track, mediaStreamRef.current);
        }
      });

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      await pc.setLocalDescription(offer);

      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve(undefined);
        } else {
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') {
              resolve(undefined);
            }
          };
        }
      });

      const response = await fetch('/api/realtime-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer: pc.localDescription }),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to initialize session');
      const { answer, sessionId } = responseData;
      if (!answer) throw new Error('No SDP answer received from server');

      sessionIdRef.current = sessionId;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      const sessionConfig = {
        type: 'session.update',
        session: {
          instructions: `You are a cute and friendly virtual bear. 
                        You speak in a warm, playful manner and love interacting with your friend.
                        Keep responses brief and engaging.`,
        }
      };
      dataChannel.send(JSON.stringify(sessionConfig));

      setListening(true);
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      alert(error instanceof Error ? error.message : 'Failed to initialize voice chat. Please try again.');
      stopWebRTC();
    } finally {
      setIsConnecting(false);
    }
  };

  const stopWebRTC = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }
    setListening(false);
  };

  // Expose toggleVoiceChat for parent to call
  React.useImperativeHandle(
    // @ts-ignore
    window.bearWebRTCRef,
    () => ({
      toggleVoiceChat: async () => {
        if (listening) {
          stopWebRTC();
        } else {
          await initializeWebRTC();
        }
      }
    }),
    [listening]
  );

  React.useEffect(() => {
    return () => {
      stopWebRTC();
    };
    // eslint-disable-next-line
  }, []);

  // UI for status only (no button, parent handles button)
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
};

export default BearWebRTC;