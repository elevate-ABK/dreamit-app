
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface VoiceConciergeProps {
  onClose: () => void;
}

const VoiceConcierge: React.FC<VoiceConciergeProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Initializing Concierge...');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // Helper functions for audio processing
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    try {
      setStatus('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Concierge is listening...');
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // FIX for TS18048: Safely access the first part of the model turn
            const parts = message.serverContent?.modelTurn?.parts;
            const base64Audio = parts?.[0]?.inlineData?.data;

            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContextRef.current,
                24000,
                1
              );
              
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            setStatus('Connection error. Please retry.');
          },
          onclose: () => {
            setIsActive(false);
            setStatus('Concierge disconnected.');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `
            You are "Elena", the elite virtual concierge for "Dream it marketing".
            Your tone is sophisticated, warm, and highly professional.
            You are an expert on the Dream it resort portfolio (Mount Amanzi, Finfoot, Alpine Heath, Blue Marlin, Peninsula).
            Your goal is to help prospective members understand the value of their time and the flexibility of our club.
            Keep responses concise and elegant.
          `,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start concierge:", err);
      setStatus('Failed to access microphone.');
    }
  };

  useEffect(() => {
    startSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-xl text-center">
        <button 
          onClick={onClose}
          className="absolute -top-16 right-0 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="space-y-12">
          {/* Animated Waveform / Aura */}
          <div className="relative flex justify-center items-center h-64">
            <div className={`absolute w-48 h-48 bg-blue-500/20 rounded-full blur-3xl transition-all duration-1000 ${isSpeaking ? 'scale-150 opacity-60' : 'scale-100 opacity-20'}`}></div>
            <div className={`absolute w-32 h-32 bg-blue-600/40 rounded-full blur-2xl transition-all duration-500 ${isSpeaking ? 'scale-125' : 'scale-100'}`}></div>
            
            {/* Visualizer bars */}
            <div className="flex items-end gap-1.5 h-16 relative z-10">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 rounded-full bg-blue-400 transition-all duration-150 ${isActive ? (isSpeaking ? 'animate-bounce' : 'animate-pulse') : 'h-2 opacity-20'}`}
                  style={{ 
                    height: isActive ? `${Math.random() * 100 + 20}%` : '8px',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: isSpeaking ? '0.5s' : '1.5s'
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-white text-4xl font-bold serif tracking-tight">Meet Elena</h2>
            <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-xs">Your Private Travel Concierge</p>
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-full inline-block">
              <span className="text-white/60 text-sm flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500'}`}></span>
                {status}
              </span>
            </div>
          </div>

          <div className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed italic">
            "Ask me about our coastal escapes or how we give you back the luxury of time."
          </div>

          <button 
            onClick={onClose}
            className="text-white/20 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold"
          >
            End Conversation
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.5); }
        }
      `}} />
    </div>
  );
};

export default VoiceConcierge;
