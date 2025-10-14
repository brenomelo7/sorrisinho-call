'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { VideoManager } from '@/lib/videoManager';

interface CallInterfaceProps {
  duration: number; // em minutos
  onCallEnd: () => void;
  videoData?: {
    url: string;
    duration: number; // duração real em segundos
    isUploaded: boolean;
  } | null;
}

export default function CallInterface({ duration, onCallEnd, videoData }: CallInterfaceProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [actualVideoDuration, setActualVideoDuration] = useState<number | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [callEndingCountdown, setCallEndingCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('🎬 CallInterface iniciado:', { duration, videoData });
    
    // Se há videoData (vídeo uploadado), usar ele
    if (videoData) {
      console.log('📹 Usando vídeo uploadado:', videoData);
      setActualVideoDuration(videoData.duration);
      // SEMPRE usar a duração real do vídeo
      setTimeLeft(videoData.duration);
      console.log(`⏱️ Timer definido para duração real: ${videoData.duration}s`);
    } else {
      // Fallback para vídeo do sistema
      const video = VideoManager.getActiveVideoByDuration(duration as 5 | 10 | 15);
      setActiveVideo(video);
      console.log('🎬 Usando vídeo do sistema:', video);
    }

    // Simular conexão
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      setIsVideoPlaying(true);
      console.log('✅ Conexão estabelecida - iniciando reprodução');
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, [duration, videoData]);

  // Timer principal da chamada
  useEffect(() => {
    if (!isConnected || timeLeft <= 0 || videoEnded) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          console.log('⏰ Tempo esgotado - encerrando chamada');
          setVideoEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, timeLeft, videoEnded]);

  // Controle do vídeo HTML5
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoData) return;

    const handleLoadedMetadata = () => {
      const realDuration = Math.round(video.duration);
      console.log(`📹 Metadados carregados - duração real: ${realDuration}s`);
      setActualVideoDuration(realDuration);
      
      // SEMPRE usar a duração real do vídeo
      setTimeLeft(realDuration);
      console.log(`⏱️ Timer ajustado para duração real: ${realDuration}s`);
    };

    const handleTimeUpdate = () => {
      const currentTime = Math.round(video.currentTime);
      setVideoCurrentTime(currentTime);
      
      // Atualizar timeLeft baseado no tempo restante do vídeo
      if (actualVideoDuration) {
        const remaining = actualVideoDuration - currentTime;
        setTimeLeft(Math.max(0, remaining));
        
        // Avisar quando restam 10 segundos
        if (remaining <= 10 && remaining > 0 && !callEndingCountdown) {
          setCallEndingCountdown(remaining);
          console.log(`⚠️ Vídeo terminando em ${remaining} segundos`);
        }
      }
    };

    const handleEnded = () => {
      console.log('🎬 Vídeo terminou - encerrando chamada automaticamente');
      setVideoEnded(true);
      setIsVideoPlaying(false);
      setTimeLeft(0);
      setCallEndingCountdown(null);
      
      // Encerrar chamada automaticamente quando vídeo termina
      setTimeout(() => {
        console.log('📞 Chamada encerrada automaticamente');
        onCallEnd();
      }, 2000); // 2 segundos para feedback visual
    };

    const handlePlay = () => {
      console.log('▶️ Vídeo iniciado');
      setIsVideoPlaying(true);
    };

    const handlePause = () => {
      console.log('⏸️ Vídeo pausado');
      setIsVideoPlaying(false);
    };

    const handleError = (e: any) => {
      console.error('❌ Erro no vídeo:', e);
      // Em caso de erro, manter a chamada funcionando
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [videoData, actualVideoDuration, onCallEnd, callEndingCountdown]);

  // Auto-play quando conectado
  useEffect(() => {
    if (isConnected && videoRef.current && videoData && !videoEnded) {
      console.log('🎬 Iniciando reprodução automática');
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('❌ Erro ao iniciar reprodução:', error);
          // Tentar novamente após interação do usuário
        });
      }
    }
  }, [isConnected, videoData, videoEnded]);

  // Countdown para encerramento
  useEffect(() => {
    if (callEndingCountdown !== null && callEndingCountdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCallEndingCountdown(prev => prev ? prev - 1 : null);
      }, 1000);
      
      return () => clearTimeout(countdownTimer);
    }
  }, [callEndingCountdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    console.log('📞 Usuário encerrou a chamada manualmente');
    onCallEnd();
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current || videoEnded) return;
    
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('❌ Erro ao reproduzir vídeo:', error);
        });
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
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
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 max-w-sm mx-auto">
            <p className="text-sm text-gray-300 mb-2">Preparando experiência:</p>
            {videoData ? (
              <>
                <p className="text-pink-400 font-medium">Vídeo Personalizado</p>
                <p className="text-xs text-gray-400 mt-1">
                  Duração real: {Math.floor(videoData.duration / 60)}min {videoData.duration % 60}s • HD Quality
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  ✅ Vídeo próprio carregado
                </p>
              </>
            ) : activeVideo ? (
              <>
                <p className="text-pink-400 font-medium">{activeVideo.name}</p>
                <p className="text-xs text-gray-400 mt-1">{duration} minutos • HD Quality</p>
              </>
            ) : (
              <>
                <p className="text-pink-400 font-medium">Chamada Especial</p>
                <p className="text-xs text-gray-400 mt-1">{duration} minutos • Experiência única</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        {videoData ? (
          // Vídeo real uploadado
          <div className="w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={videoData.url}
              muted={isMuted}
              playsInline
              preload="metadata"
              controls={false}
            />
            
            {/* Overlay quando vídeo termina */}
            {videoEnded && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-400 mx-auto mb-4">
                    <img 
                      src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
                      alt="Sorrisinho" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                    Vídeo Finalizado
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">Obrigada por este momento especial!</p>
                  <p className="text-pink-400 text-xs">Encerrando chamada automaticamente...</p>
                </div>
              </div>
            )}

            {/* Countdown de encerramento */}
            {callEndingCountdown !== null && callEndingCountdown > 0 && !videoEnded && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-red-500/90 backdrop-blur-sm rounded-2xl p-6 text-center text-white border-4 border-red-400 animate-pulse">
                  <h3 className="text-2xl font-bold mb-2">⚠️ Vídeo Terminando</h3>
                  <p className="text-4xl font-bold text-yellow-300">{callEndingCountdown}</p>
                  <p className="text-sm mt-2">segundos restantes</p>
                </div>
              </div>
            )}
          </div>
        ) : activeVideo?.videoUrl ? (
          // Vídeo do sistema (placeholder com imagem)
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-black/70">
            <div className="relative w-full max-w-4xl mx-auto">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
                alt="Sorrisinho" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
              
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white font-medium text-sm">{activeVideo.name}</p>
                <p className="text-gray-300 text-xs">{duration} minutos • HD Quality</p>
              </div>
            </div>
          </div>
        ) : (
          // Fallback se não houver vídeo
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-black/70">
            <div className="text-center text-white">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-400 mx-auto mb-4">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
                  alt="Sorrisinho" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-300">Experiência especial em andamento</p>
            </div>
          </div>
        )}
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
                {videoEnded ? 'Finalizado' : isVideoPlaying ? 'Reproduzindo' : 'Pausado'}
                {videoData && actualVideoDuration && (
                  <span className="text-blue-400 ml-2">
                    • Vídeo próprio ({Math.floor(actualVideoDuration / 60)}min {actualVideoDuration % 60}s)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${videoEnded ? 'text-gray-400' : callEndingCountdown !== null ? 'text-red-400 animate-pulse' : 'text-pink-400'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-gray-300">
              {videoEnded ? 'finalizado' : 'tempo restante'}
            </div>
            {videoData && actualVideoDuration && (
              <div className="text-xs text-blue-400 mt-1">
                Duração real: {formatTime(actualVideoDuration)}
              </div>
            )}
            {callEndingCountdown !== null && callEndingCountdown > 0 && (
              <div className="text-xs text-red-400 mt-1 font-bold animate-pulse">
                ⚠️ Terminando em {callEndingCountdown}s
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call Status */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        {videoEnded ? (
          <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Vídeo Finalizado
            </h2>
            <p className="text-gray-300 text-sm">Obrigada por este momento especial!</p>
            <p className="text-pink-400 text-xs mt-2">Encerrando automaticamente...</p>
          </div>
        ) : callEndingCountdown === null && (
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Chamada Ativa
            </h2>
            <p className="text-gray-300 text-sm">Aproveite este momento especial</p>
            {videoData ? (
              <p className="text-blue-400 text-xs mt-2">📹 Vídeo personalizado em reprodução</p>
            ) : activeVideo && (
              <p className="text-pink-400 text-xs mt-2">{activeVideo.name}</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-center gap-6">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-700/80 hover:bg-gray-600/80'
            }`}
            disabled={videoEnded}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video Play/Pause Button */}
          <button
            onClick={toggleVideoPlayback}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!videoData || videoEnded}
          >
            {isVideoPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
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
              className={`h-full transition-all duration-1000 ease-linear ${
                videoEnded 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
                  : callEndingCountdown !== null
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500'
              }`}
              style={{ 
                width: videoEnded 
                  ? '100%' 
                  : actualVideoDuration 
                    ? `${(videoCurrentTime / actualVideoDuration) * 100}%`
                    : `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%`
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{formatTime(videoCurrentTime || (duration * 60 - timeLeft))}</span>
            <span>{formatTime(actualVideoDuration || duration * 60)}</span>
          </div>
        </div>

        {/* Video Info Bar */}
        <div className="mt-4 bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm">
            <div>
              {videoData ? (
                <>
                  <p className="text-white font-medium">Vídeo Personalizado</p>
                  <p className="text-gray-400 text-xs">
                    Duração real: {actualVideoDuration ? formatTime(actualVideoDuration) : 'Carregando...'}
                  </p>
                  {callEndingCountdown !== null && (
                    <p className="text-red-400 text-xs font-bold animate-pulse">
                      ⚠️ Encerrando em {callEndingCountdown}s
                    </p>
                  )}
                </>
              ) : activeVideo ? (
                <>
                  <p className="text-white font-medium">{activeVideo.name}</p>
                  <p className="text-gray-400 text-xs">Vídeo exclusivo • {duration} minutos</p>
                </>
              ) : (
                <>
                  <p className="text-white font-medium">Experiência Especial</p>
                  <p className="text-gray-400 text-xs">Momento único • {duration} minutos</p>
                </>
              )}
            </div>
            <div className="text-right">
              {activeVideo ? (
                <>
                  <p className="text-pink-400 font-medium">R$ {activeVideo.price}</p>
                  <p className="text-gray-400 text-xs">{activeVideo.views} views</p>
                </>
              ) : (
                <div className="text-blue-400">
                  <p className="text-xs font-medium">📹 Vídeo Próprio</p>
                  <p className="text-xs">HD Quality</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}