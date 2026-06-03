import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, LogOut, Shield, LayoutDashboard, Compass, CreditCard, ChevronRight, Check, X, ShieldCheck, RefreshCw, Star } from 'lucide-react';
import { auth, db, logoutUser } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, SubscriptionTier } from './types';

// Modularity component imports
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import SEOLandingPage from './components/SEOLandingPage';
import BlogPage from './components/BlogPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation Routing Engine
  const [view, setView] = useState<string>('landing');
  const [blogArticleSlug, setBlogArticleSlug] = useState<string | null>(null);

  // Clean URL navigation processor supporting backward and forward buttons
  const navigate = (newView: string, subSlug: string | null = null) => {
    let url = '/';
    if (newView === 'blog') {
      url = subSlug ? `/blog/${subSlug}` : '/blog';
    } else if (newView === 'landing') {
      url = '/';
    } else if (newView !== 'app' && newView !== 'admin') {
      url = `/${newView}`;
    }
    
    window.history.pushState(null, '', url);
    setView(newView);
    if (newView === 'blog') {
      setBlogArticleSlug(subSlug);
    }
  };

  useEffect(() => {
    const handleUrlParsing = () => {
      const rawPath = window.location.pathname.substring(1);
      if (rawPath.startsWith('blog/')) {
        const slug = rawPath.replace('blog/', '');
        setView('blog');
        setBlogArticleSlug(slug);
      } else if (rawPath === 'blog') {
        setView('blog');
        setBlogArticleSlug(null);
      } else if ([
        'remover-metadados',
        'remover-exif',
        'metadata-remover',
        'remover-dados-da-foto',
        'image-metadata-remover',
        'limpar-metadados-imagem'
      ].includes(rawPath)) {
        setView(rawPath);
      } else if (rawPath === 'app') {
        setView('app');
      } else if (rawPath === 'admin') {
        setView('admin');
      } else {
        setView('landing');
      }
    };

    handleUrlParsing();
    window.addEventListener('popstate', handleUrlParsing);
    return () => window.removeEventListener('popstate', handleUrlParsing);
  }, []);

  // Modals / Overlays
  const [authOpen, setAuthOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState<{ active: boolean; tier: SubscriptionTier | null }>({
    active: false,
    tier: null
  });

  // Stripe Checkout Form simulation state
  const [paying, setPaying] = useState(false);

  // Sync / Fetch user profile from firestore
  const fetchProfile = async (uid: string, authUser: User) => {
    try {
      const docRef = doc(db, 'users', uid);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const d = snapshot.data();
        const isAdmin = authUser.email === 'santwomusic@gmail.com' || authUser.email === 'brisasofc@gmail.com' || authUser.email === 'admin@pixelflow.ai';
        let role = d.role || 'user';

        if (isAdmin && role !== 'admin') {
          role = 'admin';
          try {
            await updateDoc(docRef, { role: 'admin' });
          } catch (upgErr) {
            console.error("Erro ao atualizar papel para admin em fetchProfile:", upgErr);
          }
        }

        setProfile({
          uid: uid,
          email: d.email || authUser.email || '',
          displayName: d.displayName || authUser.displayName || 'Usuário',
          role,
          credits: d.credits ?? 5,
          subscriptionTier: d.subscriptionTier || 'free',
          imagesProcessed: d.imagesProcessed || 0,
          createdAt: d.createdAt?.toDate() || new Date(),
          updatedAt: d.updatedAt?.toDate() || new Date()
        });
      } else {
        // Automatically assign admin if email is our developer or bootstrapped account
        const isAdmin = authUser.email === 'santwomusic@gmail.com' || authUser.email === 'brisasofc@gmail.com' || authUser.email === 'admin@pixelflow.ai';
        
        // Setup initial free user document
        const initialProfile = {
          uid: uid,
          email: authUser.email || '',
          displayName: authUser.displayName || 'Usuário',
          role: isAdmin ? 'admin' : 'user',
          credits: isAdmin ? 1000 : 5,
          subscriptionTier: 'free',
          imagesProcessed: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(docRef, initialProfile);
        
        setProfile({
          ...initialProfile,
          role: isAdmin ? 'admin' : 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (err) {
      console.error("Erro ao sincronizar perfil do usuário: ", err);
    }
  };

  // Monitor Google Authentication States
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      if (authUser) {
        setUser(authUser);
        await fetchProfile(authUser.uid, authUser);
        
        // Match user experience: only auto-redirect if they reside on index landing
        const path = window.location.pathname.substring(1);
        if (!path || path === 'landing') {
          setView('app');
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('landing');
  };

  // Stripe Checkout payments simulation
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !showCheckout.tier) return;

    setPaying(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const userRef = doc(db, 'users', profile.uid);
      const subId = 'sub_' + Math.random().toString(36).substring(2, 11);
      const subRef = doc(db, 'subscriptions', subId);

      // Save Stripe simulation contract securely in Firestore rules
      await setDoc(subRef, {
        userId: profile.uid,
        stripeSubscriptionId: subId,
        tier: showCheckout.tier,
        status: 'active',
        createdAt: serverTimestamp()
      });

      // Grant credits/unlimited based on plan choice
      const initialCredits = showCheckout.tier === 'pro' ? 9999 : 50000;
      await setDoc(userRef, {
        ...profile,
        subscriptionTier: showCheckout.tier,
        credits: initialCredits,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Build system activity logs
      const logId = 'log_' + Math.random().toString(36).substring(2, 11);
      const logRef = doc(db, 'usage_logs', logId);
      await setDoc(logRef, {
        id: logId,
        userId: profile.uid,
        action: `Assinou plano ${showCheckout.tier.toUpperCase()} via Stripe Checkout`,
        creditsDeducted: 0,
        createdAt: serverTimestamp()
      });

      // Synchronize client-side variables
      await fetchProfile(profile.uid, user!);
      setShowCheckout({ active: false, tier: null });
      alert(`Parabéns! Sua assinatura ${showCheckout.tier.toUpperCase()} foi processada e ativada.`);
    } catch (err) {
      console.error(err);
      alert('Erro inesperado no gateway de vendas. Tente novamente.');
    } finally {
      setPaying(false);
    }
  };

  const currentPricingLabel = showCheckout.tier === 'pro' ? 'R$ 29 /mês' : 'R$ 79 /mês';

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50 relative overflow-hidden font-sans">
      
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>

      {/* SaaS Dynamic Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-[#020617]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('landing')}>
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="font-bold text-white text-lg font-display tracking-tight hover:text-amber-400 transition-colors">PixelFlow AI</span>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-6">
            
            <button
              onClick={() => navigate('landing')}
              className={`text-xs font-semibold uppercase tracking-wider ${view === 'landing' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Principal
            </button>

            <button
              onClick={() => navigate('blog')}
              className={`text-xs font-semibold uppercase tracking-wider ${view === 'blog' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Blog
            </button>

            {profile && (
              <>
                <button
                  onClick={() => navigate('app')}
                  className={`text-xs font-semibold uppercase tracking-wider ${view === 'app' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Dashboard
                </button>

                {profile.role === 'admin' && (
                  <button
                    onClick={() => navigate('admin')}
                    className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${view === 'admin' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Admin</span>
                  </button>
                )}
              </>
            )}

          </nav>

          {/* User actions */}
          <div className="flex items-center gap-4">
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
            ) : profile ? (
              <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-semibold text-slate-100 block">{profile.displayName}</span>
                  <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block font-mono">
                    {profile.subscriptionTier === 'free' ? `${profile.credits} Créditos` : 'Acesso Ilimitado'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                  title="Desconectar"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-lg"
              >
                Criar Conta
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Render */}
      <main className="flex-grow">
        {loading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-amber-400" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LandingPage
                  onStart={() => profile ? navigate('app') : setAuthOpen(true)}
                  onSelectPlan={(tier) => {
                    if (!profile) {
                      setAuthOpen(true);
                    } else if (tier === 'free') {
                      navigate('app');
                    } else {
                      setShowCheckout({ active: true, tier });
                    }
                  }}
                  isAuthenticated={!!profile}
                />
              </motion.div>
            )}

            {view === 'app' && profile && (
              <motion.div
                key="app"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Dashboard
                  userProfile={profile}
                  onRefreshProfile={() => fetchProfile(profile.uid, user!)}
                  onOpenPlanSelector={() => navigate('landing')}
                />
              </motion.div>
            )}

            {view === 'admin' && profile && profile.role === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AdminDashboard />
              </motion.div>
            )}

            {view === 'blog' && (
              <motion.div
                key="blog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BlogPage
                  currentArticleSlug={blogArticleSlug}
                  onSelectArticle={(slug) => navigate('blog', slug)}
                  onNavigateHome={() => navigate('landing')}
                  onNavigateToAuth={() => setAuthOpen(true)}
                />
              </motion.div>
            )}

            {[
              'remover-metadados',
              'remover-exif',
              'metadata-remover',
              'remover-dados-da-foto',
              'image-metadata-remover',
              'limpar-metadados-imagem'
            ].includes(view) && (
              <motion.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SEOLandingPage
                  slug={view}
                  onNavigateToAuth={() => setAuthOpen(true)}
                  onNavigateHome={() => navigate('landing')}
                  onNavigateToBlog={() => navigate('blog')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Auth Popup Modal overlay */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => navigate('app')}
      />

      {/* Stripe Checkout Simulation overlay */}
      <AnimatePresence>
        {showCheckout.active && showCheckout.tier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout({ active: false, tier: null })}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/10 bg-[#0d1024] p-8 shadow-2xl z-10"
            >
              <button
                onClick={() => setShowCheckout({ active: false, tier: null })}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest">Stripe Checkout</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 font-display">
                Ativar Plano <span className="text-amber-400 capitalize">{showCheckout.tier}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-normal mb-6">
                Preencha os dados fictícios abaixo para processar imediatamente no nosso ambiente Sandbox seguro.
              </p>

              {/* Order summary */}
              <div className="bg-slate-950 p-4 rounded-xl mb-6 border border-slate-900 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-white capitalize block mb-0.5">PixelFlow {showCheckout.tier} (Mensal)</span>
                  <span className="text-slate-500 block">Créditos de processamento estendido</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-amber-400 font-mono">{currentPricingLabel}</span>
                </div>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1.5">E-mail do faturamento</label>
                  <input
                    type="email"
                    required
                    defaultValue={profile?.email || ''}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1.5">Informações do cartão</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4242  4242  4242  4242"
                      maxLength={19}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <CreditCard className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1.5">Vencimento</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white placeholder-slate-700 text-center focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1.5">CVC</label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      maxLength={3}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white placeholder-slate-700 text-center focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-3.5 text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] font-sans"
                  >
                    {paying ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Validando cartão...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Confirmar Pagamento Simulado</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Universal Footer for Advanced SEO Internal Linking */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-12 px-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            {/* Column 1: Brand Info */}
            <div>
              <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => navigate('landing')}>
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-white text-sm font-display tracking-tight">PixelFlow AI</span>
              </div>
              <p className="text-slate-500 leading-relaxed mb-4 text-[11px]">
                Otimizador profissional de metadados binários e inibidor de rastreadores para criativos de redes sociais de alta performance.
              </p>
              <span className="text-[10px] text-slate-600 font-mono">© 2026 PixelFlow. Todos os direitos reservados.</span>
            </div>

            {/* Column 2: Otimizadores Técnicos (Sitemap keywords links) */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mb-4 text-amber-400">Ferramentas de Purificação</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigate('remover-metadados')} className="text-slate-400 hover:text-white text-left uppercase text-[10px] font-semibold transition-colors block">
                    Remover Metadados
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('remover-exif')} className="text-slate-400 hover:text-white text-left uppercase text-[10px] font-semibold transition-colors block">
                    Remover EXIF
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('metadata-remover')} className="text-slate-400 hover:text-white text-left uppercase text-[10px] font-semibold transition-colors block">
                    Metadata Remover
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Métodos de Higienização (Sitemap links) */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mb-4 text-amber-400">Métodos e Guias</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigate('remover-dados-da-foto')} className="text-slate-400 hover:text-white text-left uppercase text-[10px] font-semibold transition-colors block">
                    Remover Dados da Foto
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('image-metadata-remover')} className="text-slate-400 hover:text-white text-left uppercase text-[10px] font-semibold transition-colors block">
                    Image Metadata Remover
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('limpar-metadados-imagem')} className="text-slate-400 hover:text-white text-left uppercase text-[10px] font-semibold transition-colors block">
                    Limpar Metadados Imagem
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Central SEO Blog Resources */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mb-4 text-amber-400">Recursos de SEO</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigate('blog')} className="text-slate-400 hover:text-white text-left uppercase text-[10px] font-semibold transition-colors block">
                    Nosso Blog Oficial
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('blog', 'como-remover-metadados-de-imagens')} className="text-slate-400 hover:text-white text-left uppercase text-[10px] font-semibold transition-colors block">
                    Guia de Metadados
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('blog', 'instagram-detecta-imagens-ia')} className="text-slate-400 hover:text-white text-left uppercase text-[10px] font-semibold transition-colors block">
                    Selo de IA no Instagram
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
