
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface VideoAnimatorProps {
  onClose: () => void;
}

const VideoAnimator: React.FC<VideoAnimatorProps> = ({ onClose }) => {
  const [step, setStep] = useState<'upload' | 'generating' | 'result'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('A cinematic sweeping shot of a luxury holiday resort at sunset, gentle movement of palm trees and ocean waves.');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Initiating dream visualization...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    'Analyzing your perfect holiday vision...',
    'Synthesizing luxury atmospheres...',
    'Rendering high-fidelity vacation memories...',
    'Perfecting the gentle sway of the ocean...',
    'Almost there! Wrapping up your cinematic escape...'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startGeneration = async () => {
    // Check for API key as per Veo requirements
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }

    setStep('generating');
    let msgIndex = 0;
    const interval = setInterval(() => {
      setLoadingMessage(loadingMessages[msgIndex % loadingMessages.length]);
      msgIndex++;
    }, 12000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = selectedImage?.split(',')[1] || '';
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: base64Data,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(videoBlob));
        setStep('result');
      } else {
        throw new Error("No video link returned.");
      }

    } catch (error: any) {
      console.error("Veo Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      } else {
        alert("Something went wrong with the generation. Please ensure you have a valid paid API key selected.");
      }
      setStep('upload');
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Dream Visionizer <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2 uppercase tracking-widest font-bold tracking-widest">Veo 3.1</span></h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <i className="fas fa-times text-slate-400"></i>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8">
          {step === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                <p className="text-slate-600 mb-2">Upload a photo to see it transformed into a cinematic holiday escape.</p>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Requires a paid Google Cloud Project API Key</a>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl aspect-video flex flex-col items-center justify-center cursor-pointer transition-all ${selectedImage ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p className="font-bold text-slate-700">Click to upload your image</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
              </div>

              {selectedImage && (
                <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Atmosphere Prompt</label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(['16:9', '9:16'] as const).map(ratio => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-3 rounded-xl font-bold border-2 transition-all ${aspectRatio === ratio ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {ratio} {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={startGeneration}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                  >
                    Animate My Vision
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-pulse">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl text-blue-600">
                  <i className="fas fa-magic"></i>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{loadingMessage}</h3>
            </div>
          )}

          {step === 'result' && videoUrl && (
            <div className="max-w-3xl mx-auto space-y-8 text-center animate-[fadeIn_1s_ease-out]">
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video flex items-center justify-center">
                <video 
                  src={videoUrl} 
                  autoPlay 
                  loop 
                  controls 
                  className={`max-w-full max-h-full ${aspectRatio === '9:16' ? 'h-full w-auto' : 'w-full h-auto'}`}
                />
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <a 
                  href={videoUrl} 
                  download="dream-holiday.mp4"
                  className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
                >
                  <i className="fas fa-download"></i> Download Video
                </a>
                <button 
                  onClick={() => setStep('upload')}
                  className="bg-slate-100 text-slate-700 px-8 py-4 rounded-full font-bold hover:bg-slate-200 transition-all"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default VideoAnimator;
