// Sistema de Gerenciamento de Vídeos
export interface VideoData {
  id: string;
  name: string;
  videoUrl: string;
  duration: number; // em minutos
  price: number;
  views: number;
  isActive: boolean;
  uploadDate: string;
}

class VideoManagerSystem {
  private readonly STORAGE_KEY = 'sorrisinho_video_system';

  // Vídeos padrão do sistema
  private defaultVideos: VideoData[] = [
    {
      id: 'video_5min',
      name: 'Momento Íntimo - 5 min',
      videoUrl: 'https://example.com/video5min.mp4',
      duration: 5,
      price: 60,
      views: 0,
      isActive: true,
      uploadDate: new Date().toISOString()
    },
    {
      id: 'video_10min',
      name: 'Experiência Completa - 10 min',
      videoUrl: 'https://example.com/video10min.mp4',
      duration: 10,
      price: 100,
      views: 0,
      isActive: true,
      uploadDate: new Date().toISOString()
    },
    {
      id: 'video_15min',
      name: 'Momento Exclusivo - 15 min',
      videoUrl: 'https://example.com/video15min.mp4',
      duration: 15,
      price: 150,
      views: 0,
      isActive: true,
      uploadDate: new Date().toISOString()
    }
  ];

  // Verificar se há vídeo ativo para uma duração específica
  hasActiveVideo(duration: 5 | 10 | 15): boolean {
    const videos = this.getVideos();
    return videos.some(video => video.duration === duration && video.isActive);
  }

  // Obter vídeo ativo por duração
  getActiveVideoByDuration(duration: 5 | 10 | 15): VideoData | null {
    const videos = this.getVideos();
    return videos.find(video => video.duration === duration && video.isActive) || null;
  }

  // Obter todos os vídeos
  getVideos(): VideoData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Se não há dados salvos, usar vídeos padrão
      this.saveVideos(this.defaultVideos);
      return this.defaultVideos;
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      return this.defaultVideos;
    }
  }

  // Salvar vídeos
  private saveVideos(videos: VideoData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(videos));
    } catch (error) {
      console.error('Erro ao salvar vídeos:', error);
    }
  }

  // Registrar visualização
  recordView(duration: 5 | 10 | 15): void {
    const videos = this.getVideos();
    const videoIndex = videos.findIndex(v => v.duration === duration && v.isActive);
    
    if (videoIndex !== -1) {
      videos[videoIndex].views += 1;
      this.saveVideos(videos);
    }
  }

  // Obter preços atuais
  getCurrentPrices(): { [key: number]: number } {
    const videos = this.getVideos();
    const prices: { [key: number]: number } = {};
    
    videos.forEach(video => {
      if (video.isActive) {
        prices[video.duration] = video.price;
      }
    });

    // Preços padrão se não encontrar
    return {
      5: prices[5] || 60,
      10: prices[10] || 100,
      15: prices[15] || 150,
      ...prices
    };
  }

  // Atualizar preço de um vídeo
  updatePrice(duration: 5 | 10 | 15, newPrice: number): boolean {
    const videos = this.getVideos();
    const videoIndex = videos.findIndex(v => v.duration === duration);
    
    if (videoIndex !== -1) {
      videos[videoIndex].price = newPrice;
      this.saveVideos(videos);
      return true;
    }
    return false;
  }

  // Ativar/desativar vídeo
  toggleVideoStatus(duration: 5 | 10 | 15): boolean {
    const videos = this.getVideos();
    const videoIndex = videos.findIndex(v => v.duration === duration);
    
    if (videoIndex !== -1) {
      videos[videoIndex].isActive = !videos[videoIndex].isActive;
      this.saveVideos(videos);
      return true;
    }
    return false;
  }

  // Obter estatísticas
  getStats() {
    const videos = this.getVideos();
    return {
      totalVideos: videos.length,
      activeVideos: videos.filter(v => v.isActive).length,
      totalViews: videos.reduce((sum, v) => sum + v.views, 0),
      totalRevenue: videos.reduce((sum, v) => sum + (v.views * v.price), 0)
    };
  }
}

export const VideoManager = new VideoManagerSystem();