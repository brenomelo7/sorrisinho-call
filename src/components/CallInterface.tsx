'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';

interface CallInterfaceProps {
  duration: number; // em minutos
  onCallEnd: () => void;
}

export default function CallInterface({ duration, onCallEnd }: CallInterfaceProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // converter para segundos
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);

  useEffect(() => {
    // Simular conexão
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (!isConnected || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onCallEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, timeLeft, onCallEnd]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    onCallEnd();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-400 mx-auto mb-4 animate-pulse">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
                alt="Sorrisinho" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-pink-400 animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
            Conectando com Sorrisinho...
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-black/70">
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-full max-w-md mx-auto">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
              alt="Sorrisinho" 
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
                alt="Sorrisinho" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold">Sorrisinho</h3>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Conectada
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-gray-300">tempo restante</div>
          </div>
        </div>
      </div>

      {/* Call Status */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
          <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
            Chamada Ativa
          </h2>
          <p className="text-gray-300 text-sm">Aproveite este momento especial</p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-center gap-6">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-700/80 hover:bg-gray-600/80'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>

          {/* Video Button */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              !isVideoOn 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-700/80 hover:bg-gray-600/80'
            }`}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Sound Button */}
          <button
            onClick={() => setIsSoundOn(!isSoundOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              !isSoundOn 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-700/80 hover:bg-gray-600/80'
            }`}
          >
            {isSoundOn ? (
              <Volume2 className="w-6 h-6 text-white" />
            ) : (
              <VolumeX className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{formatTime(duration * 60 - timeLeft)}</span>
            <span>{formatTime(duration * 60)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}