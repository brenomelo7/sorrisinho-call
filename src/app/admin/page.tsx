'use client';

import { useState } from 'react';
import { Upload, Play, Trash2, Eye, DollarSign, Clock, Users, TrendingUp, Sparkles } from 'lucide-react';

interface Video {
  id: string;
  name: string;
  duration: 5 | 10 | 15;
  price: number;
  uploadDate: string;
  views: number;
  revenue: number;
  isActive: boolean;
}

interface Stats {
  totalRevenue: number;
  totalViews: number;
  activeUsers: number;
  conversionRate: number;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [videos, setVideos] = useState<Video[]>([
    {
      id: '1',
      name: 'Chamada Especial 5min',
      duration: 5,
      price: 60,
      uploadDate: '2024-01-15',
      views: 45,
      revenue: 2700,
      isActive: true
    },
    {
      id: '2', 
      name: 'Experiência Completa 10min',
      duration: 10,
      price: 100,
      uploadDate: '2024-01-14',
      views: 32,
      revenue: 3200,
      isActive: true
    },
    {
      id: '3',
      name: 'Momento Exclusivo 15min',
      duration: 15,
      price: 150,
      uploadDate: '2024-01-13',
      views: 28,
      revenue: 4200,
      isActive: true
    }
  ]);

  const [stats] = useState<Stats>({
    totalRevenue: 10100,
    totalViews: 105,
    activeUsers: 23,
    conversionRate: 68.5
  });

  const [newVideo, setNewVideo] = useState({
    name: '',
    duration: 5 as 5 | 10 | 15,
    price: 60
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Credenciais inválidas');
    }
  };

  const handleVideoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const video: Video = {
      id: Date.now().toString(),
      name: newVideo.name,
      duration: newVideo.duration,
      price: newVideo.price,
      uploadDate: new Date().toISOString().split('T')[0],
      views: 0,
      revenue: 0,
      isActive: false
    };
    setVideos([...videos, video]);
    setNewVideo({ name: '', duration: 5, price: 60 });
  };

  const toggleVideoActive = (id: string) => {
    setVideos(videos.map(video => 
      video.id === id ? { ...video, isActive: !video.isActive } : video
    ));
  };

  const deleteVideo = (id: string) => {
    setVideos(videos.filter(video => video.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-pink-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                SorrisinhoCall
              </h1>
            </div>
            <h2 className="text-xl text-white mb-2">Painel Administrativo</h2>
            <p className="text-gray-400">Faça login para acessar</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Digite seu usuário"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Digite sua senha"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-pink-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                SorrisinhoCall Admin
              </h1>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Receita Total</p>
                <p className="text-2xl font-bold text-white">R$ {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total de Views</p>
                <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Usuários Ativos</p>
                <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Video Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-pink-400" />
              Upload de Vídeo
            </h2>
            
            <form onSubmit={handleVideoUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Vídeo
                </label>
                <input
                  type="text"
                  value={newVideo.name}
                  onChange={(e) => setNewVideo({ ...newVideo, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Ex: Chamada Especial"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração
                </label>
                <select
                  value={newVideo.duration}
                  onChange={(e) => setNewVideo({ ...newVideo, duration: Number(e.target.value) as 5 | 10 | 15 })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value={5}>5 minutos</option>
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  value={newVideo.price}
                  onChange={(e) => setNewVideo({ ...newVideo, price: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Arquivo de Vídeo
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-pink-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Clique para selecionar ou arraste o arquivo aqui</p>
                  <p className="text-sm text-gray-500 mt-2">MP4, máximo 500MB</p>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
              >
                Upload Vídeo
              </button>
            </form>
          </div>

          {/* Videos List */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-purple-400" />
              Vídeos Cadastrados
            </h2>
            
            <div className="space-y-4">
              {videos.map((video) => (
                <div key={video.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{video.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {video.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          R$ {video.price}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {video.views} views
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleVideoActive(video.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          video.isActive 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                        }`}
                      >
                        {video.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Upload: {video.uploadDate}</span>
                    <span className="text-green-400 font-medium">R$ {video.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}