import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Wallet, LogIn, Mail, Lock, UserPlus } from 'lucide-react';

export function AuthView({ onContinueOffline }) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            style={{ background: 'var(--primary-gradient)' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30"
          >
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Kişisel Finans</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Hesabınıza giriş yapın, verilerinizi tüm cihazlarınızda güvenle eşitleyin.</p>
        </div>

        <Card padding="p-6" className="space-y-6">
          <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Google ile {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-slate-200 dark:bg-slate-800"></div>
            <span className="relative bg-white dark:bg-slate-900 px-4 text-xs font-semibold text-slate-400 uppercase">VEYA E-POSTA İLE</span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/50">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">E-Posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 font-bold" disabled={loading}>
              {loading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
            </Button>
          </form>

          <div className="text-center">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              {isLogin ? 'Hesabınız yok mu? Yeni hesap oluşturun' : 'Zaten hesabınız var mı? Giriş yapın'}
            </button>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <button 
            type="button" 
            onClick={onContinueOffline}
            className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Sadece bu cihazda (Çevrimdışı) kullanmaya devam et &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
