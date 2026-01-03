
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';

interface VoiceConciergeProps {
  onClose: () => void;
}

const RESORT_IMAGES: Record<string, { name: string; location: string; url: string }> = {
  'mount-amanzi': { 
    name: 'Mount Amanzi', 
    location: 'Magalies River, Hartbeespoort', 
    url: 'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&q=80&w=1200' 
  },
  'finfoot': { 
    name: 'Finfoot Lake Reserve', 
    location: 'Vaalkop Dam, North West', 
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200' 
  },
  'alpine-heath': { 
    name: 'Alpine Heath Resort', 
    location: 'Northern Drakensberg, KZN', 
    url: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&q=80&w=1200' 
  },
  'breakers': { 
    name: 'Breakers Resort', 
    location: 'Umhlanga Rocks, Durban', 
    url: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=1200' 
  },
  'blue-marlin': { 
    name: 'Blue Marlin Hotel', 
    location: 'Scottburgh, KZN South Coast', 
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200' 
  },
  'peninsula': { 
    name: 'The Peninsula', 
    location: 'Sea Point, Cape Town', 
    url: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&q=80&w=1200' 
  },
  'safari': { 
    name: 'The Safari Collection', 
    location: 'South African Bushveld', 
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1200' 
  },
  'coastal': { 
    name: 'Coastal Escapes', 
    location: 'KwaZulu-Natal & Cape Shores', 
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200' 
  }
};

const displayVisualsFn: FunctionDeclaration = {
  name: 'display_resort_visuals',
  parameters: {
    type: Type.OBJECT,
    description: 'Display an image of a specific resort or holiday category to the user.',
    properties: {
      destination_id: {
        type: Type.STRING,
        description: 'The slug of the resort or category to show. Options: mount-amanzi, finfoot, alpine-heath, breakers, blue-marlin, peninsula, safari, coastal',
      },
    },
    required: ['destination_id'],
  },
};

const VoiceConcierge: React.FC<VoiceConciergeProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVisual, setCurrentVisual] = useState<typeof RESORT_IMAGES['mount-amanzi'] | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio utils
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };
  const createBlob = (data: Float32Array) => ({
    data: encode(new Uint8Array(new Int16Array(data.map(v => v * 32768)).buffer)),
    mimeType: 'audio/pcm;rate=16000',
  });

  const cleanup = useCallback(() => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (outputAudioContextRef.current) { outputAudioContextRef.current.close(); outputAudioContextRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    setIsActive(false);
    setIsSpeaking(false);
  }, []);

  const startSession = async () => {
    cleanup();
    setError(null);
    setStatus('Connecting to Elena...');

    try {
      // Check for API key as per environment requirement
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
          setStatus('Selecting API Key...');
          await window.aistudio.openSelectKey();
      }

      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing and Key Selector is unavailable.");
      }

      // Re-initialize AI client to ensure the latest key is used right before connect
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Elena is listening...');
            if (audioContextRef.current) {
              const source = audioContextRef.current.createMediaStreamSource(stream);
              const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (e) => {
                const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
                sessionPromise.then(s => s?.sendRealtimeInput({ media: pcmBlob }));
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current.destination);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls (Images)
            if (message.toolCall && message.toolCall.functionCalls) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'display_resort_visuals') {
                  const id = (fc.args as any).destination_id;
                  if (RESORT_IMAGES[id]) {
                    setCurrentVisual(RESORT_IMAGES[id]);
                  }
                  sessionPromise.then(s => s?.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "Image displayed successfully" } }
                  }));
                }
              }
            }

            // Handle Audio
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContextRef.current.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e: any) => { 
            console.error("Live session error:", e);
            if (e.message?.includes("Requested entity was not found")) {
                // Reset key selection if entity missing (key issue)
                window.aistudio.openSelectKey();
            }
            setError("Connection error. Please ensure a valid API key is selected."); 
            setIsActive(false); 
          },
          onclose: (e) => { setIsActive(false); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: [displayVisualsFn] }],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `
            You are "Elena", the elite concierge for Dream Vacation Club (DVC).
            IMPORTANT: You have a display screen in front of the user. 
            Whenever you mention a resort (Mount Amanzi, Finfoot, Alpine Heath, Breakers, Blue Marlin, Peninsula) or a holiday type (Safari, Coastal), you MUST call the 'display_resort_visuals' function with the correct ID.
            
            Your knowledge is dreamvacs.com. Focus on "The Luxury of Time" and points flexibility.
            Be sophisticated, warm, and encourage users to visualize their perfect escape.
          `,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error("Startup error:", err);
      setError(err.message || "Elena is currently offline.");
      setStatus('Elena is unavailable.');
    }
  };

  useEffect(() => {
    startSession();
    return () => cleanup();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute -top-16 right-0 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-50"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="w-full grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Visual Area */}
          <div className="relative aspect-[4/5] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10 flex items-center justify-center group">
            {currentVisual ? (
              <div className="absolute inset-0 animate-[fadeIn_1s_ease-out]">
                <img src={currentVisual.url} alt={currentVisual.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                  <h3 className="text-white text-xl font-bold serif mb-1">{currentVisual.name}</h3>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">{currentVisual.location}</p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-30">
                <i className="fas fa-camera-retro text-6xl text-white/20"></i>
                <p className="text-white text-xs uppercase tracking-[0.3em] font-bold">Visualizing your escape...</p>
              </div>
            )}
            
            {/* Overlay visualizer when speaking on image */}
            {isSpeaking && (
              <div className="absolute top-6 right-6 flex items-center gap-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-1 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                ))}
              </div>
            )}
          </div>

          {/* Elena Status Area */}
          <div className="text-center lg:text-left space-y-12">
            <div className="space-y-4">
              <h2 className="text-white text-5xl md:text-7xl font-bold serif tracking-tight">Meet Elena</h2>
              <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-xs">Dream Vacation Club Expert</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col lg:items-start items-center gap-4">
                <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl inline-block backdrop-blur-md">
                  <span className="text-white/80 text-sm flex items-center gap-4 font-medium">
                    <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500'}`}></span>
                    {status}
                  </span>
                </div>

                {!isActive && (
                  <button onClick={startSession} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20">
                    Reconnect Concierge
                  </button>
                )}
              </div>

              {/* Waveform Visualization (Classic Aura style for Elena) */}
              <div className="flex items-end justify-center lg:justify-start gap-2 h-12">
                {[...Array(16)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 rounded-full bg-blue-500/40 transition-all duration-150 ${isSpeaking ? 'bg-blue-400' : ''}`}
                    style={{ 
                      height: isActive ? (isSpeaking ? `${Math.random() * 100 + 20}%` : '8px') : '4px',
                      opacity: isActive ? (isSpeaking ? 1 : 0.3) : 0.1,
                      transition: 'height 0.1s ease-out'
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] uppercase font-bold tracking-wider">{error}</div>}

            <p className="text-white/40 text-sm max-w-md leading-relaxed italic border-l-2 border-white/5 pl-6">
              "Tell me what your perfect day looks like, and I'll show you exactly where that memory is waiting to be made."
            </p>

            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors uppercase tracking-[0.4em] text-[10px] font-black">
              End Conversation
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounce { 0%, 100% { height: 4px; } 50% { height: 16px; } }
      `}} />
    </div>
  );
};

export default VoiceConcierge;
