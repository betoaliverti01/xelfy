import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { Lock, Mail, User, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmationNeeded, setConfirmationNeeded] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
          window.location.reload();
        }, 1200);
      } else {
        // Confirmation email was sent
        setConfirmationNeeded(true);
      }
    } catch (err) {
      console.error('Erro no cadastro:', err);
      let msg = 'Erro ao criar conta. Tente novamente.';
      if (err.message?.includes('already registered')) {
        msg = 'Este e-mail já está cadastrado. Faça login para continuar.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[#2d91a8] selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#52cfc1]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2d91a8] to-[#52cfc1] flex items-center justify-center shadow-lg shadow-teal-500/20 font-bold text-gray-950 text-xl tracking-wider group-hover:scale-105 transition-transform">
            X
          </div>
          <span className="text-2xl font-black tracking-tight text-white">xelfy</span>
        </Link>
        
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white">
          Crie sua conta gratuita
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Já possui uma conta?{' '}
          <Link to="/login" className="font-medium text-[#52cfc1] hover:underline">
            Faça login aqui
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-gray-900/90 border border-gray-800 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {confirmationNeeded ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-[#2d91a8]/20 border border-[#2d91a8]/40 rounded-full flex items-center justify-center mx-auto text-[#52cfc1]">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Confirme seu e-mail</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Enviamos um link de confirmação para <span className="text-[#52cfc1] font-semibold">{email}</span>.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Por favor, verifique sua caixa de entrada e spam para ativar sua conta do xelfy.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-gray-950 bg-gradient-to-r from-[#2d91a8] to-[#52cfc1] hover:brightness-110 transition-all shadow-lg shadow-teal-500/20"
                >
                  Ir para a página de Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmationNeeded(false)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Voltar e alterar dados
                </button>
              </div>
            </div>
          ) : (
            <>
              <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Nome Completo
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User className="h-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome ou da sua empresa"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2d91a8] focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                E-mail
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2d91a8] focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="block w-full pl-11 pr-11 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2d91a8] focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Confirmar Senha
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2d91a8] focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-teal-500/20 text-sm font-bold text-gray-950 bg-gradient-to-r from-[#2d91a8] to-[#52cfc1] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2d91a8] transition-all disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar Minha Conta
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
