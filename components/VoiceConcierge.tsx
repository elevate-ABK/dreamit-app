
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';

interface VoiceConciergeProps {
  onClose: () => void;
}

const RESORT_IMAGES: Record<string, { name: string; location: string; url: string }> = {
  'mount-amanzi': { name: 'Mount Amanzi', location: 'Hartbeespoort', url: 'https://images.unsplash.com/photo-1618245472895-780993510c43?auto=format&fit=crop&q=80&w=1200' },
  'finfoot': { name: 'Finfoot Lake Reserve', location: 'Vaalkop Dam', url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200' },
  'alpine-heath': { name: 'Alpine Heath Resort', location: 'Northern Drakensberg', url: 'https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&q=80&w=1200' },
  'breakers': { name: 'Breakers Resort', location: 'Umhlanga Rocks', url: 'https://images.unsplash.com/photo-1533281813136-1e967a5b3a32?auto=format&fit=crop&q=80&w=1200' },
  'blue-marlin': { name: 'Blue Marlin Hotel', location: 'Scottburgh', url: 'https://images.unsplash.com/photo-1579624538964-f6558ec40a02?auto=format&fit=crop&q=80&w=1200' },
  'peninsula': { name: 'The Peninsula', location: 'Sea Point', url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&q=80&w=1200' },
  'safari': { name: 'The Safari Collection', location: 'South African Bushveld', url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1200' },
  'coastal': { name: 'Coastal Escapes', location: 'KZN & Cape Shores', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200' }
};

const displayVisualsFn: FunctionDeclaration = {
  name: 'display_resort_visuals',
  parameters: {
    type: Type.OBJECT,
    description: 'Display an image of a specific resort or holiday category to the user.',
    properties: {
      destination_id: {
        type: Type.STRING,
        description: 'The slug of the resort. Options: mount-amanzi, finfoot, alpine-heath, breakers, blue-marlin, peninsula, safari, coastal',
      },
    },
    required: ['destination_id'],
  },
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const VoiceConcierge: React.FC<VoiceConciergeProps> = ({ onClose }) => {
  const [sessionState, setSessionState] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [status, setStatus] = useState('Elena is resting...');
  const [currentVisual, setCurrentVisual] = useState<typeof RESORT_IMAGES['mount-amanzi'] | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  
  const currentInputText = useRef('');
  const currentOutputText = useRef('');
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cleanup = useCallback(() => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    setSessionState('idle');
    setIsSpeaking(false);
    nextStartTimeRef.current = 0;
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [transcriptions]);

  const startSession = async () => {
    cleanup();
    setSessionState('connecting');
    setStatus('Contacting Elena...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setSessionState('active');
            setStatus('Elena is here');
            if (audioContextRef.current) {
              const source = audioContextRef.current.createMediaStreamSource(stream);
              const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                const pcm = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
                // CRITICAL: Solely rely on sessionPromise resolution and call session.sendRealtimeInput.
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcm });
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current.destination);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              currentInputText.current = message.serverContent.inputTranscription.text ?? '';
              setStatus('Listening...');
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputText.current += message.serverContent.outputTranscription.text ?? '';
              setStatus('Elena is speaking...');
            }
            if (message.serverContent?.turnComplete) {
              setTranscriptions(prev => [
                ...prev,
                ...(currentInputText.current ? [{ role: 'user' as const, text: currentInputText.current }] : []),
                ...(currentOutputText.current ? [{ role: 'model' as const, text: currentOutputText.current }] : [])
              ].slice(-6));
              currentInputText.current = '';
              currentOutputText.current = '';
              setStatus('Elena is here');
            }
            if (message.toolCall?.functionCalls) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'display_resort_visuals') {
                  const id = (fc.args as any).destination_id;
                  if (RESORT_IMAGES[id]) setCurrentVisual(RESORT_IMAGES[id]);
                  // CRITICAL: Solely rely on sessionPromise resolution and call session.sendToolResponse.
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: { id: fc.id, name: fc.name, response: { result: "Displayed" } }
                    });
                  });
                }
              }
            }
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
              setStatus('Elena interrupted');
            }
          },
          onerror: (e) => { console.error(e); setSessionState('error'); setStatus('Connection Drift'); },
          onclose: () => cleanup()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: [displayVisualsFn] }],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are Elena, the elite Dream Vacation Club concierge. You are sophisticated, warm, and helpful. Focus on the luxury of time. Assist users in exploring our exclusive portfolio of resorts. Toward the end of a helpful exchange or if the user seems ready to plan, graciously offer to prepare a bespoke, personalized itinerary based on your conversation today, which can be sent to them if they provide their contact details.',
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setSessionState('error');
      setStatus('Unable to reach Elena');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-slate-900 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row h-[85vh] md:h-[70vh] animate-[cardSlide_0.6s_ease-out]">
        
        {/* Left Side: Identity & Status */}
        <div className="w-full md:w-[40%] bg-slate-950/50 p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/5">
          <div className="text-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Concierge Suite</h4>
            <h2 className="text-3xl font-bold text-white serif">Elena</h2>
          </div>

          <div className="relative group">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 ${sessionState === 'active' ? 'bg-blue-600/10 border border-blue-500/20 scale-110 shadow-2xl shadow-blue-500/10' : 'bg-white/5 border border-white/10'}`}>
              {sessionState === 'active' ? (
                <div className="flex gap-1.5 h-8 items-end">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-1 bg-blue-400 rounded-full ${isSpeaking ? 'animate-[wave_1s_ease-in-out_infinite]' : 'h-2'}`} style={{ animationDelay: `${i * 0.15}s`, height: isSpeaking ? '100%' : '8px' }} />
                  ))}
                </div>
              ) : (
                <i className={`fas ${sessionState === 'connecting' ? 'fa-circle-notch animate-spin' : 'fa-microphone'} text-2xl text-white/20`}></i>
              )}
              {sessionState === 'active' && <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping opacity-20"></div>}
            </div>
          </div>

          <div className="text-center w-full space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">{status}</p>
            {sessionState !== 'active' && (
              <button onClick={startSession} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                {sessionState === 'idle' ? 'Start Session' : 'Retry Connection'}
              </button>
            )}
            <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              Close Suite
            </button>
          </div>
        </div>

        {/* Right Side: Context & Visuals */}
        <div className="flex-grow flex flex-col bg-slate-900/40 relative">
          
          {/* Resort Image Context */}
          <div className={`absolute inset-0 transition-all duration-1000 ${currentVisual ? 'opacity-10' : 'opacity-0'}`}>
            {currentVisual && <img src={currentVisual.url} className="w-full h-full object-cover filter blur-xl" alt="" />}
          </div>

          <div className="relative z-10 flex-grow flex flex-col p-8 overflow-hidden">
            {currentVisual ? (
              <div className="mb-8 animate-[fadeIn_1s_ease-out]">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video border border-white/10">
                  <img src={currentVisual.url} className="w-full h-full object-cover" alt="" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1">{currentVisual.location}</p>
                    <h3 className="text-white text-xl font-bold serif">{currentVisual.name}</h3>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center opacity-10 space-y-4">
                <i className="fas fa-compass text-6xl"></i>
                <p className="text-xs font-bold uppercase tracking-[0.3em]">No Visual Context</p>
              </div>
            )}

            <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-4 pr-4 scrollbar-hide">
              {transcriptions.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeInUp_0.4s_ease-out]`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${t.role === 'user' ? 'bg-blue-600/20 border border-blue-500/20 text-blue-100' : 'bg-white/5 border border-white/5 text-slate-300'}`}>
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 bg-slate-950/20 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/20 italic font-medium">Elena uses real-time spatial awareness. Just describe your dream.</p>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cardSlide { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes wave { 0%, 100% { height: 20%; } 50% { height: 100%; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default VoiceConcierge;
