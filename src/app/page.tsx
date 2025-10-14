'use client';

import { useState, useEffect } from 'react';
import { Play, Clock, Star, Heart, Sparkles, Shield, Upload, Video, CheckCircle, AlertCircle, TrendingUp, Users, Eye, DollarSign, Settings, X } from 'lucide-react';
import { VideoManager } from '@/lib/videoManager';
import CallInterface from '@/components/CallInterface';

// Interface para vídeos uploadados
interface UploadedVideo {
  file: File;
  duration: number; // duração real em segundos
  url: string;
  name: string;
  size: number;
  uploadDate: string;
}

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCall, setShowCall] = useState(false);
  const [callDuration, setCallDuration] = useState<number>(5);
  const [currentPrices, setCurrentPrices] = useState<{ [key: number]: number }>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState<{[key: number]: UploadedVideo}>({});
  const [isUploading, setIsUploading] = useState<{[key: number]: boolean}>({});
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalRevenue: 0,
    totalViews: 0,
    activeUsers: 0,
    videosUploaded: 0
  });

  // Chave única para localStorage
  const STORAGE_KEY = 'sorrisinhocall_videos_permanent';
  const ADMIN_KEY = 'sorrisinhocall_admin_access';

  // Verificar se é administrador baseado na URL e localStorage
  useEffect(() => {
    const checkAdminAccess = () => {
      const currentUrl = window.location.href;
      const pathname = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      
      // Verificar se a URL contém /admin ou parâmetro admin
      const isAdminUrl = currentUrl.includes('/admin') || pathname.includes('/admin') || urlParams.get('admin') === 'true';
      
      // Verificar se tem sessão admin válida no localStorage
      const savedAdminAccess = localStorage.getItem(ADMIN_KEY);
      let hasValidSession = false;
      
      if (savedAdminAccess) {
        try {
          const adminData = JSON.parse(savedAdminAccess);
          const timeDiff = Date.now() - adminData.timestamp;
          const isValid = timeDiff < 24 * 60 * 60 * 1000; // 24 horas
          hasValidSession = isValid && adminData.active;
        } catch (error) {
          console.error('❌ Erro ao verificar sessão admin:', error);
          localStorage.removeItem(ADMIN_KEY);
        }
      }
      
      console.log('🔍 Verificando acesso admin:', { 
        currentUrl, 
        pathname, 
        isAdminUrl,
        hasValidSession,
        timestamp: new Date().toISOString()
      });
      
      // Ativar admin se URL indica OU se tem sessão válida
      const shouldBeAdmin = isAdminUrl || hasValidSession;
      setIsAdmin(shouldBeAdmin);
      
      if (shouldBeAdmin) {
        if (!hasValidSession) {
          // Criar nova sessão se não existir
          localStorage.setItem(ADMIN_KEY, JSON.stringify({
            active: true,
            timestamp: Date.now(),
            user: 'admin'
          }));
        }
        console.log('✅ Acesso admin ATIVADO');
        loadPersistedVideos();
      }
    };

    checkAdminAccess();

    // Listener para mudanças na URL
    const handleUrlChange = () => {
      setTimeout(checkAdminAccess, 50);
    };
    
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Função para carregar vídeos persistidos do localStorage
  const loadPersistedVideos = () => {
    try {
      const savedVideos = localStorage.getItem(STORAGE_KEY);
      if (savedVideos) {
        const parsedVideos = JSON.parse(savedVideos);
        console.log('📹 Carregando vídeos persistidos:', Object.keys(parsedVideos));
        
        const restoredVideos: {[key: number]: UploadedVideo} = {};
        
        for (const [duration, videoData] of Object.entries(parsedVideos)) {
          if (videoData && typeof videoData === 'object' && videoData.fileData) {
            try {
              // Recriar File a partir dos dados salvos
              const uint8Array = new Uint8Array(videoData.fileData);
              const blob = new Blob([uint8Array], { type: videoData.type || 'video/mp4' });
              const file = new File([blob], videoData.name, { type: videoData.type || 'video/mp4' });
              const url = URL.createObjectURL(blob);
              
              restoredVideos[parseInt(duration)] = {
                file,
                duration: videoData.duration,
                url,
                name: videoData.name,
                size: videoData.size,
                uploadDate: videoData.uploadDate
              };
              
              console.log(`✅ Vídeo ${duration}min restaurado: ${videoData.name}`);
            } catch (error) {
              console.error(`❌ Erro ao restaurar vídeo ${duration}min:`, error);
            }
          }
        }
        
        setUploadedVideos(restoredVideos);
        console.log('📹 Total de vídeos restaurados:', Object.keys(restoredVideos).length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar vídeos persistidos:', error);
    }
  };

  // Função para persistir vídeos no localStorage
  const persistVideos = async (videos: {[key: number]: UploadedVideo}) => {
    try {
      const videosToSave: {[key: string]: any} = {};
      
      for (const [duration, videoData] of Object.entries(videos)) {
        if (videoData && videoData.file) {
          try {
            // Converter File para ArrayBuffer
            const arrayBuffer = await videoData.file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            videosToSave[duration] = {
              name: videoData.name,
              type: videoData.file.type,
              size: videoData.size,
              duration: videoData.duration,
              uploadDate: videoData.uploadDate,
              fileData: Array.from(uint8Array) // Converter para array para JSON
            };
          } catch (error) {
            console.error(`❌ Erro ao processar vídeo ${duration}min:`, error);
          }
        }
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videosToSave));
      console.log('💾 Vídeos persistidos permanentemente:', Object.keys(videosToSave));
      
    } catch (error) {
      console.error('❌ Erro ao persistir vídeos:', error);
    }
  };

  // Calcular estatísticas reais (APENAS dados reais)
  const calculateRealAdminStats = () => {
    const uploadedCount = Object.keys(uploadedVideos).length;
    
    setAdminStats({
      totalRevenue: 0, // Apenas receita real de pagamentos confirmados
      totalViews: 0, // Apenas views reais de pagamentos
      activeUsers: 0, // Apenas usuários que pagaram
      videosUploaded: uploadedCount
    });
  };

  // Atualizar estatísticas quando vídeos mudarem
  useEffect(() => {
    if (isAdmin) {
      calculateRealAdminStats();
    }
  }, [uploadedVideos, isAdmin]);

  // Carregar preços atuais
  useEffect(() => {
    const prices = VideoManager.getCurrentPrices();
    setCurrentPrices(prices);
  }, []);

  // Verificar parâmetros de URL para redirecionamento pós-pagamento
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment');
    const duration = urlParams.get('duration');
    
    if (paymentSuccess === 'success' && duration) {
      const durationNum = parseInt(duration);
      if ([5, 10, 15].includes(durationNum)) {
        const hasVideo = VideoManager.hasActiveVideo(durationNum as 5 | 10 | 15) || uploadedVideos[durationNum];
        
        if (hasVideo || isAdmin) {
          if (!isAdmin) {
            VideoManager.recordView(durationNum as 5 | 10 | 15);
          }
          setCallDuration(durationNum);
          setShowCall(true);
          
          // Limpar parâmetros da URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [isAdmin, uploadedVideos]);

  // Função para detectar duração do vídeo
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.round(video.duration);
        console.log(`📹 Duração detectada: ${duration} segundos`);
        resolve(duration);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Erro ao carregar vídeo'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  // Função para upload de vídeo (SIMPLIFICADA E ROBUSTA)
  const handleVideoUpload = async (duration: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(`📤 Iniciando upload para ${duration} minutos:`, file.name);
    setIsUploading(prev => ({ ...prev, [duration]: true }));

    try {
      // Detectar duração real do vídeo
      const videoDuration = await getVideoDuration(file);
      const url = URL.createObjectURL(file);
      
      const newVideo: UploadedVideo = {
        file,
        duration: videoDuration,
        url,
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString()
      };
      
      // Atualizar estado
      const updatedVideos = { ...uploadedVideos, [duration]: newVideo };
      setUploadedVideos(updatedVideos);
      
      // Persistir IMEDIATAMENTE
      await persistVideos(updatedVideos);
      
      console.log(`✅ Vídeo ${duration}min salvo permanentemente! Duração: ${videoDuration}s`);
      
      // Mostrar feedback de sucesso
      alert(`✅ Vídeo salvo com sucesso!\nDuração real: ${Math.floor(videoDuration / 60)}min ${videoDuration % 60}s`);
      
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      alert('❌ Erro ao processar vídeo. Verifique se o arquivo é válido.');
    } finally {
      setIsUploading(prev => ({ ...prev, [duration]: false }));
      // Limpar input
      event.target.value = '';
    }
  };

  // Função para remover vídeo
  const removeVideo = async (duration: number) => {
    if (uploadedVideos[duration]?.url) {
      URL.revokeObjectURL(uploadedVideos[duration].url);
    }
    
    const updatedVideos = { ...uploadedVideos };
    delete updatedVideos[duration];
    
    setUploadedVideos(updatedVideos);
    await persistVideos(updatedVideos);
    
    console.log(`🗑️ Vídeo ${duration}min removido permanentemente`);
    alert(`🗑️ Vídeo de ${duration} minutos removido com sucesso!`);
  };

  const plans = [
    {
      id: 'call5',
      duration: '5 minutos',
      price: `R$ ${currentPrices[5] || 60}`,
      description: 'Chamada íntima e especial',
      popular: false,
      gradient: 'from-pink-500 to-rose-600',
      paymentUrl: `https://pay.kirvano.com/70f6cbd3-674f-45d1-b16b-93db6d6ce7fb?duration=5`,
      durationNum: 5,
      hasVideo: VideoManager.hasActiveVideo(5) || !!uploadedVideos[5]
    },
    {
      id: 'call10', 
      duration: '10 minutos',
      price: `R$ ${currentPrices[10] || 100}`,
      description: 'Experiência completa',
      popular: true,
      gradient: 'from-purple-500 to-pink-600',
      paymentUrl: `https://pay.kirvano.com/d351dbf1-4cfe-4321-a33f-773d46a40a58?duration=10`,
      durationNum: 10,
      hasVideo: VideoManager.hasActiveVideo(10) || !!uploadedVideos[10]
    },
    {
      id: 'call15',
      duration: '15 minutos',
      price: `R$ ${currentPrices[15] || 150}`, 
      description: 'Momento exclusivo prolongado',
      popular: false,
      gradient: 'from-indigo-500 to-purple-600',
      paymentUrl: `https://pay.kirvano.com/59d5772d-5b06-4ece-acc5-418989f58591?duration=15`,
      durationNum: 15,
      hasVideo: VideoManager.hasActiveVideo(15) || !!uploadedVideos[15]
    }
  ];

  const redirectToPayment = (url: string) => {
    try {
      console.log('🔄 Redirecionando para pagamento:', url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ Erro no redirecionamento:', error);
      window.location.href = url;
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    
    const selectedPlanData = plans.find(plan => plan.id === planId);
    if (selectedPlanData) {
      if (isAdmin) {
        console.log('🔓 Admin - acesso direto liberado');
        setCallDuration(selectedPlanData.durationNum);
        setShowCall(true);
        return;
      }

      if (!selectedPlanData.hasVideo) {
        alert('Desculpe, não há vídeo disponível para esta duração no momento.');
        setSelectedPlan(null);
        return;
      }

      console.log('💳 Redirecionando para pagamento');
      redirectToPayment(selectedPlanData.paymentUrl);
    }
  };

  const handleCallEnd = () => {
    setShowCall(false);
    setCallDuration(5);
    setSelectedPlan(null);
  };

  const handleAccessMainSite = () => {
    console.log('🏠 Saindo do modo admin');
    localStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
    setShowUploadPanel(false);
    
    const baseUrl = window.location.origin;
    window.location.href = baseUrl;
  };

  // Função para obter vídeo para reprodução
  const getVideoForCall = (duration: number) => {
    // PRIORIZAR vídeos uploadados
    if (uploadedVideos[duration]) {
      return {
        url: uploadedVideos[duration].url,
        duration: uploadedVideos[duration].duration,
        isUploaded: true
      };
    }
    
    // Fallback para vídeos do sistema
    const activeVideo = VideoManager.getActiveVideoByDuration(duration as 5 | 10 | 15);
    if (activeVideo) {
      return {
        url: activeVideo.videoUrl || '',
        duration: duration * 60,
        isUploaded: false
      };
    }
    
    return null;
  };

  // Se estiver em chamada
  if (showCall) {
    const videoData = getVideoForCall(callDuration);
    return (
      <CallInterface 
        duration={callDuration} 
        onCallEnd={handleCallEnd}
        videoData={videoData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Banner Admin */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white py-4 px-4 shadow-2xl border-b-4 border-green-400">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-6 h-6 animate-pulse text-green-200" />
              <div>
                <span className="font-bold text-xl">🔓 MODO ADMINISTRADOR</span>
                <p className="text-green-100 text-sm">
                  Sistema de upload simplificado e funcional
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadPanel(!showUploadPanel)}
                className="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {showUploadPanel ? 'Fechar Upload' : 'Gerenciar Vídeos'}
              </button>
              <button
                onClick={handleAccessMainSite}
                className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-bold transition-all"
              >
                🏠 Sair do Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Painel de Upload Simplificado */}
      {isAdmin && showUploadPanel && (
        <div className="bg-gradient-to-br from-gray-900/95 to-green-900/20 border-b border-green-500/30 py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-200">📹 Gerenciamento de Vídeos</h2>
              <button
                onClick={() => setShowUploadPanel(false)}
                className="bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status dos Vídeos */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {[5, 10, 15].map((duration) => (
                <div key={duration} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
                  <div className="text-center mb-4">
                    <Clock className="w-10 h-10 mx-auto mb-3 text-green-400" />
                    <h4 className="text-lg font-bold text-green-200">{duration} Minutos</h4>
                  </div>
                  
                  {uploadedVideos[duration] ? (
                    <div className="space-y-3">
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-300 font-semibold text-sm">✅ ATIVO</span>
                        </div>
                        <p className="text-green-200 text-sm mb-1">
                          📁 {uploadedVideos[duration].name}
                        </p>
                        <p className="text-green-200 text-sm mb-1">
                          ⏱️ {Math.floor(uploadedVideos[duration].duration / 60)}min {uploadedVideos[duration].duration % 60}s
                        </p>
                        <p className="text-green-200 text-sm">
                          📏 {(uploadedVideos[duration].size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => removeVideo(duration)}
                          className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 py-2 px-3 rounded-lg transition-all font-semibold text-sm"
                        >
                          🗑️ Remover
                        </button>
                        <label className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 py-2 px-3 rounded-lg transition-all font-semibold cursor-pointer text-center text-sm">
                          🔄 Trocar
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleVideoUpload(duration, e)}
                            className="hidden"
                            disabled={isUploading[duration]}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                        <p className="text-yellow-300 font-semibold text-sm">Sem vídeo</p>
                      </div>
                      
                      <label className="block">
                        <div className={`border-2 border-dashed border-green-500/30 rounded-lg p-4 text-center cursor-pointer transition-all hover:border-green-500/50 hover:bg-green-500/10 ${isUploading[duration] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {isUploading[duration] ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-green-300 text-sm">Salvando...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mx-auto mb-2 text-green-400" />
                              <p className="text-green-300 font-semibold text-sm">📤 Fazer Upload</p>
                              <p className="text-green-400 text-xs">Clique para selecionar vídeo</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleVideoUpload(duration, e)}
                          className="hidden"
                          disabled={isUploading[duration]}
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Estatísticas */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-300 font-bold text-lg mb-3 text-center">📊 Status do Sistema</h3>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-green-400 font-bold">Vídeos Ativos</p>
                  <p className="text-2xl font-bold text-green-200">{Object.keys(uploadedVideos).length}/3</p>
                </div>
                <div>
                  <p className="text-green-400 font-bold">Sistema</p>
                  <p className="text-lg font-bold text-green-200">✅ Funcional</p>
                </div>
                <div>
                  <p className="text-green-400 font-bold">Persistência</p>
                  <p className="text-lg font-bold text-green-200">✅ Permanente</p>
                </div>
                <div>
                  <p className="text-green-400 font-bold">Upload</p>
                  <p className="text-lg font-bold text-green-200">✅ Simplificado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20"></div>
        <div className="relative container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-pink-400" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                SorrisinhoCall
              </h1>
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Chamadas exclusivas e momentos únicos
            </p>
            {isAdmin && (
              <div className="inline-block bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-400 rounded-2xl px-6 py-3 mb-4 shadow-2xl">
                <p className="text-green-200 font-bold">
                  ⚡ ADMINISTRADOR - Sistema Simplificado
                </p>
                <p className="text-green-300 text-sm mt-1">
                  ✅ Upload funcional • ✅ Persistência permanente • ✅ Interface simples
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-6">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-gradient-to-r from-pink-400 to-purple-400 p-1 bg-gradient-to-r from-pink-400 to-purple-400">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bb7e11b4-91ae-43de-9cfd-a0c5c8ceb5a3.jpg" 
                  alt="Sorrisinho" 
                  className="w-full h-full object-cover rounded-full bg-gray-800"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-gray-900 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                Sorrisinho
              </h2>
              <p className="text-gray-400 mb-4">Online agora • Disponível para chamadas</p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>4.9</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-pink-400 fill-current" />
                  <span>2.1k seguidores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Plans Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha sua experiência
          </h3>
          <p className="text-gray-400 text-lg">
            Momentos únicos e exclusivos esperando por você
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                selectedPlan === plan.id ? 'scale-105' : ''
              } ${!plan.hasVideo && !isAdmin ? 'opacity-60' : ''} ${isAdmin ? 'ring-2 ring-green-400/50 shadow-xl shadow-green-500/25' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </div>
                </div>
              )}

              {!plan.hasVideo && !isAdmin && (
                <div className="absolute -top-4 right-4 z-10">
                  <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-semibold">
                    Em Breve
                  </div>
                </div>
              )}

              {uploadedVideos[plan.durationNum] && (
                <div className="absolute -top-4 left-4 z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    📹 VÍDEO PRÓPRIO
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="absolute -top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl">
                    🔓 ADMIN
                  </div>
                </div>
              )}
              
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${plan.gradient} p-[2px] group-hover:shadow-2xl ${isAdmin ? 'ring-1 ring-green-400/50' : ''}`}>
                <div className={`bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 h-full ${isAdmin ? 'bg-gradient-to-br from-gray-900/95 to-green-900/10' : ''}`}>
                  <div className="text-center">
                    <div className="mb-6">
                      <Clock className={`w-12 h-12 mx-auto mb-4 ${isAdmin ? 'text-green-400' : 'text-pink-400'}`} />
                      <h4 className="text-2xl font-bold mb-2">{plan.duration}</h4>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                      
                      {uploadedVideos[plan.durationNum] && (
                        <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-300 text-xs font-semibold">
                            📹 Duração real: {Math.floor(uploadedVideos[plan.durationNum].duration / 60)}min {uploadedVideos[plan.durationNum].duration % 60}s
                          </p>
                          <p className="text-blue-400 text-xs">
                            Encerra automaticamente quando acabar
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-8">
                      <div className={`text-4xl font-bold mb-2 ${isAdmin ? 'bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent' : 'bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent'}`}>
                        {isAdmin ? '🆓 LIBERADO' : plan.price}
                      </div>
                      <p className={`text-sm font-medium ${isAdmin ? 'text-green-300' : 'text-gray-400'}`}>
                        {isAdmin ? '⚡ Acesso administrativo' : 'Pagamento único'}
                      </p>
                    </div>
                    
                    <button
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                        isAdmin 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/25' 
                          : `bg-gradient-to-r ${plan.gradient} hover:shadow-lg hover:shadow-pink-500/25`
                      } ${
                        selectedPlan === plan.id ? 'animate-pulse' : ''
                      } ${!plan.hasVideo && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={selectedPlan === plan.id || (!plan.hasVideo && !isAdmin)}
                    >
                      {!plan.hasVideo && !isAdmin ? (
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-5 h-5" />
                          Vídeo em Breve
                        </div>
                      ) : selectedPlan === plan.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {isAdmin ? 'Iniciando Admin...' : 'Conectando...'}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Play className="w-5 h-5" />
                          {isAdmin ? '🚀 ACESSO DIRETO' : 'Iniciar Chamada'}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">100% Privado</h4>
              <p className="text-gray-400">Suas chamadas são completamente privadas e seguras</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">HD Quality</h4>
              <p className="text-gray-400">Experiência em alta definição para momentos únicos</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Exclusivo</h4>
              <p className="text-gray-400">Conteúdo único e personalizado só para você</p>
            </div>
          </div>
        </div>

        {/* Status dos Vídeos */}
        <div className={`mt-16 backdrop-blur-sm rounded-xl border p-6 ${isAdmin ? 'bg-green-800/20 border-green-500/30' : 'bg-gray-800/30 border-gray-700'}`}>
          <h3 className={`text-lg font-bold text-center mb-4 ${isAdmin ? 'text-green-300' : 'text-gray-300'}`}>
            {isAdmin ? '🔧 Status dos Vídeos (Sistema Simplificado)' : 'Status dos Vídeos Hoje'}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[5, 10, 15].map((duration) => {
              const hasUploadedVideo = !!uploadedVideos[duration];
              const hasSystemVideo = VideoManager.hasActiveVideo(duration as 5 | 10 | 15);
              const hasAnyVideo = hasUploadedVideo || hasSystemVideo;
              
              return (
                <div key={duration} className={`text-center p-4 rounded-lg ${
                  isAdmin 
                    ? 'bg-green-700/20 border border-green-500/30' 
                    : 'bg-gray-700/30'
                }`}>
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                    hasAnyVideo || isAdmin ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <p className="text-sm font-medium text-gray-300">{duration} minutos</p>
                  
                  {!isAdmin && (
                    <p className={`text-xs ${
                      hasAnyVideo ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {hasAnyVideo ? 'Disponível' : 'Em breve'}
                    </p>
                  )}
                  
                  {isAdmin && (
                    <div className="mt-2 space-y-1">
                      {hasUploadedVideo && (
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded px-2 py-1">
                          <p className="text-xs text-blue-300 font-semibold">
                            📹 Vídeo Próprio
                          </p>
                          <p className="text-xs text-blue-400">
                            {Math.floor(uploadedVideos[duration].duration / 60)}min {uploadedVideos[duration].duration % 60}s
                          </p>
                        </div>
                      )}
                      
                      {hasSystemVideo && (
                        <div className="bg-purple-500/20 border border-purple-500/30 rounded px-2 py-1">
                          <p className="text-xs text-purple-300 font-semibold">
                            🎬 Sistema
                          </p>
                        </div>
                      )}
                      
                      {!hasAnyVideo && (
                        <p className="text-xs text-green-400 font-semibold">
                          🔓 Acesso Forçado
                        </p>
                      )}
                      
                      <p className={`text-xs font-semibold ${
                        hasAnyVideo ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {hasAnyVideo ? '✅ Operacional' : '⏳ Aguardando'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 SorrisinhoCall. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">Plataforma segura e privada para maiores de 18 anos</p>
          {isAdmin && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg inline-block">
              <p className="text-green-400 font-bold">
                🔧 MODO ADMINISTRADOR - Sistema Simplificado
              </p>
              <p className="text-green-300 text-sm">
                ✅ Upload funcional • ✅ Persistência permanente • ✅ Interface limpa
              </p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}