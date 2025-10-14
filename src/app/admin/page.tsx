'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { adminSystem, VideoData, AdminStats } from '@/lib/adminSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Video, 
  Play, 
  Trash2, 
  Eye, 
  DollarSign, 
  Users, 
  Clock, 
  BarChart3,
  LogOut,
  Shield,
  CheckCircle,
  AlertCircle,
  FileVideo,
  Calendar
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [stats, setStats] = useState<AdminStats>({ totalVideos: 0, totalRevenue: 0, totalCalls: 0, averageCallDuration: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVideo, setPreviewVideo] = useState<VideoData | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!adminSystem.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    setIsAuthenticated(true);
    loadData();
  }, [router]);

  const loadData = () => {
    setVideos(adminSystem.getVideos());
    setStats(adminSystem.getStats());
  };

  const handleLogout = () => {
    adminSystem.logout();
    router.push('/login');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Por favor, selecione apenas arquivos de vídeo.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Criar URL do vídeo
      const videoUrl = URL.createObjectURL(file);
      
      // Obter duração do vídeo
      const duration = await getVideoDuration(videoUrl);
      
      // Salvar vídeo
      const videoData = {
        name: file.name,
        url: videoUrl,
        duration: Math.round(duration),
        size: file.size
      };

      const savedVideo = adminSystem.saveVideo(videoData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        loadData();
        
        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);

    } catch (error) {
      console.error('Erro no upload:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Erro ao fazer upload do vídeo. Tente novamente.');
    }
  };

  const getVideoDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.src = url;
    });
  };

  const handleDeleteVideo = (videoId: string) => {
    if (confirm('Tem certeza que deseja excluir este vídeo?')) {
      adminSystem.deleteVideo(videoId);
      loadData();
      if (previewVideo?.id === videoId) {
        setPreviewVideo(null);
      }
    }
  };

  const handlePreviewVideo = (video: VideoData) => {
    setPreviewVideo(video);
    setActiveTab('preview');
  };

  const startCallSimulation = (video: VideoData) => {
    const callSession = adminSystem.startCall(video.id);
    
    // Simular chamada com duração real do vídeo
    setTimeout(() => {
      adminSystem.endCall(callSession.id);
      loadData();
    }, video.duration * 1000);

    alert(`Chamada iniciada! Duração: ${adminSystem.formatDuration(video.duration)}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mr-3">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Sorrisinho Call</h1>
                  <p className="text-sm text-gray-500">Painel Administrativo</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-1" />
                Logado como Admin
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center">
              <FileVideo className="w-4 h-4 mr-2" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vídeos</CardTitle>
                  <FileVideo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVideos}</div>
                  <p className="text-xs text-muted-foreground">
                    Vídeos disponíveis
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminSystem.formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Baseado em chamadas reais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Chamadas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCalls}</div>
                  <p className="text-xs text-muted-foreground">
                    Chamadas completadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminSystem.formatDuration(Math.round(stats.averageCallDuration))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por chamada
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>
                  Informações sobre o funcionamento atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">Sistema Operacional</p>
                      <p className="text-sm text-green-700">Todos os serviços funcionando normalmente</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Video className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium text-blue-900">Armazenamento de Vídeos</p>
                      <p className="text-sm text-blue-700">Persistência ativa no navegador</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos */}
          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Vídeos</CardTitle>
                <CardDescription>
                  Lista de todos os vídeos disponíveis no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {videos.length === 0 ? (
                  <div className="text-center py-12">
                    <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nenhum vídeo encontrado</p>
                    <Button onClick={() => setActiveTab('upload')}>
                      <Upload className="w-4 h-4 mr-2" />
                      Fazer Upload
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                      <Card key={video.id} className="overflow-hidden">
                        <div className="aspect-video bg-gray-100 relative">
                          <video
                            src={video.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              onClick={() => handlePreviewVideo(video)}
                              className="mr-2"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-sm mb-2 truncate">{video.name}</h3>
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                            <span>{adminSystem.formatDuration(video.duration)}</span>
                            <span>{adminSystem.formatFileSize(video.size)}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreviewVideo(video)}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => startCallSimulation(video)}
                              className="flex-1"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Testar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteVideo(video.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload de Vídeos</CardTitle>
                <CardDescription>
                  Adicione novos vídeos ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    
                    {isUploading ? (
                      <div className="space-y-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6 text-pink-500" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-2">Fazendo upload...</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500">{Math.round(uploadProgress)}% concluído</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-2">Selecione um vídeo</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Arraste e solte ou clique para selecionar
                          </p>
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Escolher Arquivo
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Os vídeos são salvos localmente no navegador e permanecerão disponíveis mesmo após recarregar a página.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview do Vídeo</CardTitle>
                <CardDescription>
                  Visualize como o cliente verá o vídeo durante a chamada
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewVideo ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        src={previewVideo.url}
                        controls
                        className="w-full h-full"
                        onEnded={() => {
                          alert('Vídeo finalizado! Na chamada real, a conexão seria encerrada automaticamente.');
                        }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 mb-1">Nome</p>
                        <p className="font-medium truncate">{previewVideo.name}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 mb-1">Duração</p>
                        <p className="font-medium">{adminSystem.formatDuration(previewVideo.duration)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 mb-1">Tamanho</p>
                        <p className="font-medium">{adminSystem.formatFileSize(previewVideo.size)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-500 mb-1">Receita/Chamada</p>
                        <p className="font-medium text-green-600">
                          {adminSystem.formatCurrency(Math.ceil(previewVideo.duration / 60) * 0.50)}
                        </p>
                      </div>
                    </div>

                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Este é exatamente como o cliente verá o vídeo. Ao final, a chamada será encerrada automaticamente.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Selecione um vídeo para visualizar</p>
                    <Button onClick={() => setActiveTab('videos')}>
                      Ver Vídeos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}