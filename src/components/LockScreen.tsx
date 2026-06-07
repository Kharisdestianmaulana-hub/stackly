import * as React from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(false);

    try {
      const isValid = await window.stackly?.settings.verifyPassword(password);
      if (isValid) {
        onUnlock();
      } else {
        setError(true);
        setPassword('');
      }
    } catch (err) {
      setError(true);
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-[#050B14] z-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-electric-blue/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-electric-blue" />
        </div>
        
        <h1 className="text-3xl font-bold text-text-primary mb-2 text-center">App Locked</h1>
        <p className="text-text-secondary text-center mb-8">
          Masukkan Master Password Anda untuk mengakses Stackly dan mengatur server.
        </p>

        <form onSubmit={handleSubmit} className="w-full relative">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            disabled={loading}
            placeholder="Enter password..."
            className={`w-full bg-input border rounded-lg px-4 py-3 text-text-primary focus:outline-none transition-colors ${
              error ? 'border-danger focus:border-danger' : 'border-border-strong focus:border-primary-blue'
            }`}
          />
          <button
            type="submit"
            disabled={!password || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-electric-blue text-white rounded-md hover:bg-primary-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {error && (
          <div className="flex items-center text-danger mt-4 text-sm bg-danger/10 px-3 py-2 rounded-md">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Password salah. Silakan coba lagi.
          </div>
        )}
      </div>
    </div>
  );
}
