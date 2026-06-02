import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, X, Shield, Sparkles } from 'lucide-react';
import { loginWithGoogle } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Falha na autenticação. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900 p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-white font-display">
                Entre no <span className="text-amber-400">PixelFlow AI</span>
              </h3>
              <p className="mt-2 text-xs text-slate-400 font-medium">
                Faça login para salvar seu histórico, ganhar créditos e aprimorar suas imagens geradas de IA.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Login CTA */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-amber-400 hover:bg-amber-300 p-3 text-xs font-black uppercase tracking-widest text-slate-950 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(251,191,36,0.2)]"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Entrar com o Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Notice Footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
              <Shield className="h-3.5 w-3.5 text-amber-500/50" />
              <span>Autenticação 100% segura provida pelo Google Firebase.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
