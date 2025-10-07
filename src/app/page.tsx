'use client';

import { useState } from 'react';
import { Play, Clock, Star, Heart, Sparkles } from 'lucide-react';

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'call5',
      duration: '5 minutos',
      price: 'R$ 60',
      description: 'Chamada íntima e especial',
      popular: false,
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      id: 'call10', 
      duration: '10 minutos',
      price: 'R$ 100',
      description: 'Experiência completa',
      popular: true,
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'call15',
      duration: '15 minutos',
      price: 'R$ 150', 
      description: 'Momento exclusivo prolongado',
      popular: false,
      gradient: 'from-indigo-500 to-purple-600'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    // Simular redirecionamento para pagamento
    setTimeout(() => {
      window.location.href = `/${planId}`;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
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
          </div>

          {/* Profile Section */}
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
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </div>
                </div>
              )}
              
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${plan.gradient} p-[2px] group-hover:shadow-2xl group-hover:shadow-pink-500/25`}>
                <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 h-full">
                  <div className="text-center">
                    <div className="mb-6">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-pink-400" />
                      <h4 className="text-2xl font-bold mb-2">{plan.duration}</h4>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>
                    
                    <div className="mb-8">
                      <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                        {plan.price}
                      </div>
                      <p className="text-gray-400 text-sm">Pagamento único</p>
                    </div>
                    
                    <button
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r ${plan.gradient} hover:shadow-lg hover:shadow-pink-500/25 ${
                        selectedPlan === plan.id ? 'animate-pulse' : ''
                      }`}
                      disabled={selectedPlan === plan.id}
                    >
                      {selectedPlan === plan.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Conectando...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Play className="w-5 h-5" />
                          Iniciar Chamada
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
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 SorrisinhoCall. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">Plataforma segura e privada para maiores de 18 anos</p>
        </div>
      </footer>
    </div>
  );
}