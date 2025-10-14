// Sistema de Administração Completo - Novo
export interface VideoData {
  id: string;
  name: string;
  url: string;
  duration: number;
  uploadDate: string;
  size: number;
}

export interface AdminStats {
  totalVideos: number;
  totalRevenue: number;
  totalCalls: number;
  averageCallDuration: number;
}

export interface CallSession {
  id: string;
  startTime: string;
  endTime?: string;
  videoId: string;
  revenue: number;
  completed: boolean;
}

class AdminSystemManager {
  private readonly STORAGE_KEYS = {
    VIDEOS: 'sorrisinho_admin_videos',
    STATS: 'sorrisinho_admin_stats',
    CALLS: 'sorrisinho_admin_calls',
    AUTH: 'sorrisinho_admin_auth'
  };

  // Credenciais do novo sistema
  private readonly CREDENTIALS = {
    username: 'sorrisinho',
    password: 'call2024@admin'
  };

  // Autenticação
  authenticate(username: string, password: string): boolean {
    const isValid = username === this.CREDENTIALS.username && password === this.CREDENTIALS.password;
    if (isValid) {
      const authData = {
        authenticated: true,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      };
      localStorage.setItem(this.STORAGE_KEYS.AUTH, JSON.stringify(authData));
    }
    return isValid;
  }

  isAuthenticated(): boolean {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEYS.AUTH);
      if (!authData) return false;
      
      const auth = JSON.parse(authData);
      return auth.authenticated && Date.now() < auth.expires;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEYS.AUTH);
  }

  // Gerenciamento de Vídeos
  saveVideo(videoData: Omit<VideoData, 'id' | 'uploadDate'>): VideoData {
    const videos = this.getVideos();
    const newVideo: VideoData = {
      ...videoData,
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadDate: new Date().toISOString()
    };
    
    videos.push(newVideo);
    localStorage.setItem(this.STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    this.updateStats();
    return newVideo;
  }

  getVideos(): VideoData[] {
    try {
      const videos = localStorage.getItem(this.STORAGE_KEYS.VIDEOS);
      return videos ? JSON.parse(videos) : [];
    } catch {
      return [];
    }
  }

  deleteVideo(videoId: string): boolean {
    const videos = this.getVideos();
    const filteredVideos = videos.filter(v => v.id !== videoId);
    
    if (filteredVideos.length !== videos.length) {
      localStorage.setItem(this.STORAGE_KEYS.VIDEOS, JSON.stringify(filteredVideos));
      this.updateStats();
      return true;
    }
    return false;
  }

  getVideoById(videoId: string): VideoData | null {
    const videos = this.getVideos();
    return videos.find(v => v.id === videoId) || null;
  }

  // Sistema de Chamadas
  startCall(videoId: string): CallSession {
    const video = this.getVideoById(videoId);
    if (!video) throw new Error('Vídeo não encontrado');

    const callSession: CallSession = {
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date().toISOString(),
      videoId,
      revenue: this.calculateCallRevenue(video.duration),
      completed: false
    };

    const calls = this.getCalls();
    calls.push(callSession);
    localStorage.setItem(this.STORAGE_KEYS.CALLS, JSON.stringify(calls));
    
    return callSession;
  }

  endCall(callId: string): void {
    const calls = this.getCalls();
    const callIndex = calls.findIndex(c => c.id === callId);
    
    if (callIndex !== -1) {
      calls[callIndex].endTime = new Date().toISOString();
      calls[callIndex].completed = true;
      localStorage.setItem(this.STORAGE_KEYS.CALLS, JSON.stringify(calls));
      this.updateStats();
    }
  }

  getCalls(): CallSession[] {
    try {
      const calls = localStorage.getItem(this.STORAGE_KEYS.CALLS);
      return calls ? JSON.parse(calls) : [];
    } catch {
      return [];
    }
  }

  // Cálculo de receita baseado na duração real
  private calculateCallRevenue(durationInSeconds: number): number {
    const baseRate = 0.50; // R$ 0,50 por minuto
    const minutes = Math.ceil(durationInSeconds / 60);
    return minutes * baseRate;
  }

  // Estatísticas
  getStats(): AdminStats {
    try {
      const stats = localStorage.getItem(this.STORAGE_KEYS.STATS);
      return stats ? JSON.parse(stats) : this.generateInitialStats();
    } catch {
      return this.generateInitialStats();
    }
  }

  private updateStats(): void {
    const videos = this.getVideos();
    const calls = this.getCalls();
    const completedCalls = calls.filter(c => c.completed);
    
    const stats: AdminStats = {
      totalVideos: videos.length,
      totalRevenue: completedCalls.reduce((sum, call) => sum + call.revenue, 0),
      totalCalls: completedCalls.length,
      averageCallDuration: this.calculateAverageCallDuration(completedCalls)
    };

    localStorage.setItem(this.STORAGE_KEYS.STATS, JSON.stringify(stats));
  }

  private calculateAverageCallDuration(calls: CallSession[]): number {
    if (calls.length === 0) return 0;
    
    const totalDuration = calls.reduce((sum, call) => {
      if (call.endTime) {
        const duration = new Date(call.endTime).getTime() - new Date(call.startTime).getTime();
        return sum + (duration / 1000); // em segundos
      }
      return sum;
    }, 0);

    return totalDuration / calls.length;
  }

  private generateInitialStats(): AdminStats {
    return {
      totalVideos: 0,
      totalRevenue: 0,
      totalCalls: 0,
      averageCallDuration: 0
    };
  }

  // Utilitários
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const adminSystem = new AdminSystemManager();