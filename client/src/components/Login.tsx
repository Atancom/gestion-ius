import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales incorrectas. Por favor intente de nuevo.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />

      <div className="w-full max-w-md p-8 z-10">
        
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl">
            
            {/* Logo/Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30 mb-4">
                    <span className="text-3xl font-bold text-white">I</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Continuar en Gestión de Líneas IusTime</h1>
                
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">Email Corporativo</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-background/50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="nombre@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="password"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-background/50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-2"
                >
                    Ingresar al Sistema
                    <ArrowRight className="h-4 w-4" />
                </button>

            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-xs text-muted-foreground">
                    ¿Olvidaste tu contraseña? Contacta al administrador del sistema.
                </p>
            </div>
        </div>

        {/* Demo Credentials Hint */}
        <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground text-center backdrop-blur-sm">
            <p className="font-semibold mb-1">Credenciales Demo:</p>
            <p>Admin: admin@iustime.com / admin</p>
            <p>User: ana.tanco@solfico.es / An@t4505</p>
        </div>

      </div>
    </div>
  );
};
