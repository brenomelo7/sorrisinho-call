// Utilitários para a plataforma CallStream

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatação de tempo
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Formatação de moeda brasileira
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Formatação de data brasileira
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

// Formatação de data simples
export function formatDateSimple(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

// Geração de ID único
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validação de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Simulação de delay para APIs
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cálculo de estatísticas
export function calculateStats(payments: any[], videos: any[]) {
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  const todayPayments = payments.filter(p => 
    new Date(p.date).toDateString() === new Date().toDateString()
  ).length;
  const activeVideos = videos.filter(v => v.isActive).length;

  return {
    totalRevenue,
    totalViews,
    todayPayments,
    activeVideos,
  };
}

// Simulação de processamento de pagamento
export async function processPayment(planId: string, email: string): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  // Simulação de delay de processamento
  await delay(2000);
  
  // Simulação de sucesso (90% de chance)
  const success = Math.random() > 0.1;
  
  if (success) {
    return {
      success: true,
      transactionId: generateId(),
    };
  } else {
    return {
      success: false,
      error: "Falha no processamento do pagamento. Tente novamente.",
    };
  }
}

// Validação de arquivo de vídeo
export function validateVideoFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 500 * 1024 * 1024; // 500MB
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato de arquivo não suportado. Use MP4, WebM ou OGG.',
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 500MB.',
    };
  }
  
  return { valid: true };
}

// Geração de URL de vídeo (simulação)
export function generateVideoUrl(videoId: string): string {
  // Em produção, isso seria uma URL real do CDN/storage
  return `/api/videos/${videoId}`;
}

// Logging de eventos (para analytics)
export function logEvent(event: string, data?: any): void {
  if (typeof window !== 'undefined') {
    console.log(`[CallStream] ${event}:`, data);
    // Aqui seria integrado com analytics real (Google Analytics, etc.)
  }
}