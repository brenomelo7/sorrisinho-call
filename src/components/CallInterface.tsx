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
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detectar dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const mobile = isMobileDevice || isSmallScreen || isTouchDevice;
      setIsMobile(mobile);
      
      console.log('📱 CallInterface - Detecção mobile:', {
        isMobileDevice,
        isSmallScreen,
        isTouchDevice,
        finalResult: mobile
      });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  useEffect(() => {
    console.log('🎬 CallInterface iniciado:', { duration, videoData, isMobile });
    
    // Se há videoData (vídeo uploadado), usar ele
    if (videoData) {
      console.log('📹 Usando vídeo uploadado:', videoData);
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
  }, [duration, videoData, isMobile]);

  // Controle do vídeo HTML5 com suporte mobile aprimorado
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoData) return;

    const handleLoadedMetadata = () => {
      const realDuration = Math.round(video.duration);
      console.log(`📹 Metadados carregados - duração real: ${realDuration}s`);
    };

    const handleEnded = () => {
      console.log('🎬 Vídeo terminou - encerrando chamada automaticamente');
      setVideoEnded(true);
      setIsVideoPlaying(false);
      
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

    // Configurações específicas para mobile
    if (isMobile) {
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.muted = true; // Iniciar mutado no mobile para permitir autoplay
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [videoData, onCallEnd, isMobile]);

  // Auto-play quando conectado com suporte mobile melhorado
  useEffect(() => {
    if (isConnected && videoRef.current && videoData && !videoEnded) {
      console.log('🎬 Iniciando reprodução automática (Mobile:', isMobile, ')');
      
      const video = videoRef.current;
      
      // Para mobile, garantir configurações corretas
      if (isMobile) {
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
      }
      
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Reprodução iniciada com sucesso');
            // Se iniciou mutado no mobile, permitir que usuário ative som
            if (isMobile && video.muted) {
              setIsMuted(true);
            }
          })
          .catch(error => {
            console.error('❌ Erro ao iniciar reprodução:', error);
            // Para mobile, tentar novamente após interação
            if (isMobile) {
              console.log('📱 Aguardando interação do usuário para reproduzir');
            }
          });
      }
    }
  }, [isConnected, videoData, videoEnded, isMobile]);

  const handleEndCall = () => {
    console.log('📞 Usuário encerrou a chamada manualmente');
    onCallEnd();
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current || videoEnded) return;
    
    const video = videoRef.current;
    
    if (isVideoPlaying) {
      video.pause();
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('❌ Erro ao reproduzir vídeo:', error);
          // Para mobile, pode precisar de interação do usuário
          if (isMobile) {
            console.log('📱 Interação necessária para reproduzir no mobile');
          }
        });
      }
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
      console.log('🔊 Som', newMutedState ? 'desativado' : 'ativado');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center text-white px-4">
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
            <p className="text-sm text-gray-300 mb-2">Preparando chamada:</p>
            <p className="text-pink-400 font-medium">Chamada Especial</p>
            <p className="text-xs text-gray-400 mt-1">HD Quality • Experiência única</p>
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
              webkit-playsinline="true"
              preload="metadata"
              controls={false}
              style={{
                // Garantir que o vídeo ocupe toda a tela no mobile
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            
            {/* Overlay quando vídeo termina */}
            {videoEnded && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-400 mx-auto mb-4">
                    <img 
                      src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
                      alt="Sorrisinho" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                    Chamada Finalizada
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">Obrigada por este momento especial!</p>
                  <p className="text-pink-400 text-xs">Encerrando chamada...</p>
                </div>
              </div>
            )}
          </div>
        ) : activeVideo?.videoUrl ? (
          // Vídeo do sistema (placeholder com imagem)
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-black/70">
            <div className="relative w-full max-w-4xl mx-auto px-4">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
                alt="Sorrisinho" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
            </div>
          </div>
        ) : (
          // Fallback se não houver vídeo
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-black/70">
            <div className="text-center text-white px-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-400 mx-auto mb-4">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
                  alt="Sorrisinho" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-300">Chamada especial em andamento</p>
            </div>
          </div>
        )}
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-pink-400">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
                alt="Sorrisinho" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm md:text-base">Sorrisinho</h3>
              <div className="flex items-center gap-2 text-xs md:text-sm text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {videoEnded ? 'Finalizado' : 'Ao vivo'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Status */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none px-4">
        {videoEnded ? (
          <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center text-white">
            <h2 className="text-lg md:text-xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Chamada Finalizada
            </h2>
            <p className="text-gray-300 text-sm">Obrigada por este momento especial!</p>
            <p className="text-pink-400 text-xs mt-2">Encerrando automaticamente...</p>
          </div>
        ) : (
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center text-white">
            <h2 className="text-lg md:text-xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              Chamada Ativa
            </h2>
            <p className="text-gray-300 text-sm">Aproveite este momento especial</p>
          </div>
        )}
      </div>

      {/* Bottom Controls - Otimizado para mobile */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:p-6">
        <div className={`flex items-center justify-center ${isMobile ? 'gap-3' : 'gap-6'}`}>
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
                : 'bg-gray-700/80 hover:bg-gray-600/80 active:bg-gray-500/80'
            }`}
            disabled={videoEnded}
          >
            {isMuted ? (
              <MicOff className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            ) : (
              <Mic className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            )}
          </button>

          {/* Video Play/Pause Button */}
          <button
            onClick={toggleVideoPlayback}
            className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation`}
            disabled={!videoData || videoEnded}
          >
            {isVideoPlaying ? (
              <Pause className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            ) : (
              <Play className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className={`${isMobile ? 'w-14 h-14' : 'w-16 h-16'} bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation`}
          >
            <PhoneOff className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
          </button>

          {/* Video Button */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation ${
              !isVideoOn 
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
                : 'bg-gray-700/80 hover:bg-gray-600/80 active:bg-gray-500/80'
            }`}
          >
            {isVideoOn ? (
              <Video className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            ) : (
              <VideoOff className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            )}
          </button>

          {/* Sound Button */}
          <button
            onClick={() => setIsSoundOn(!isSoundOn)}
            className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation ${
              !isSoundOn 
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
                : 'bg-gray-700/80 hover:bg-gray-600/80 active:bg-gray-500/80'
            }`}
          >
            {isSoundOn ? (
              <Volume2 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            ) : (
              <VolumeX className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}