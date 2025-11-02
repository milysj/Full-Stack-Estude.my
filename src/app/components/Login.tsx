'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from 'react-bootstrap';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarEsqueciSenha, setMostrarEsqueciSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }), // ⚠️ campos corretos
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.message || 'Erro desconhecido');
        return;
      }

      // Salva token no localStorage
      localStorage.setItem('token', data.token);
      console.log('✅ Token salvo:', data.token);

      // Redireciona dependendo se o perfil já foi criado
      if (data.perfilCriado) {
        router.push('/pages/home');
      } else {
        router.push('/pages/criarPerfil');
      }

      setSucesso('Login realizado com sucesso!');
    } catch (error) {
      console.error(error);
      setErro('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 h-screen flex-col relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url('/img/background-image-login-register.png')` }}
    >
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <Image width={400} height={128} src="/svg/EstudeMyLogo.svg" alt="Logo" />
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="text-sm text-left">Email:</label>
            <input
              type="email"
              placeholder="Digite seu endereço de e-mail"
              className="rounded-lg py-2 px-3 text-sm border border-gray-300 w-full"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col relative">
            <label className="text-sm mb-1 text-left">Senha:</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite sua senha"
                className="w-full rounded-lg py-2 px-4 pr-10 text-sm border border-gray-300 bg-blue-100"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.964 9.964 0 012.41-4.042M6.112 6.112A9.967 9.967 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zM3 3l18 18"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          <Button type="submit" variant="primary">Login</Button>

          <p className="text-center text-sm mt-2">
            <button
              type="button"
              onClick={() => setMostrarEsqueciSenha(true)}
              className="text-blue-600 hover:underline"
            >
              Esqueci minha senha
            </button>
          </p>

          {sucesso && <p className="text-green-600 text-sm text-center">{sucesso}</p>}
        </form>

        {mostrarEsqueciSenha && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-3">Recuperar Senha</h3>
            <p className="text-sm text-gray-600 mb-3">
              Digite seu email e você receberá um link para redefinir sua senha
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={emailRecuperacao}
                onChange={(e) => setEmailRecuperacao(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!emailRecuperacao) {
                      setErro('Por favor, digite seu email');
                      return;
                    }

                    setSalvando(true);
                    setErro('');
                    setSucesso('');

                    try {
                      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                      const res = await fetch(`${API_URL}/api/users/solicitar-recuperacao`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: emailRecuperacao,
                        }),
                      });

                      const data = await res.json();

                      if (!res.ok) {
                        setErro(data.message || 'Erro ao solicitar recuperação');
                        return;
                      }

                      setSucesso('Se o email existir em nosso sistema, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada!');
                      setMostrarEsqueciSenha(false);
                      setEmailRecuperacao('');
                    } catch (error) {
                      console.error(error);
                      setErro('Erro ao conectar com o servidor.');
                    } finally {
                      setSalvando(false);
                    }
                  }}
                  disabled={salvando}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1 disabled:bg-gray-400"
                >
                  {salvando ? 'Enviando...' : 'Enviar Link'}
                </button>
                <button
                  onClick={() => {
                    setMostrarEsqueciSenha(false);
                    setEmailRecuperacao('');
                    setErro('');
                    setSucesso('');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center"></div>
        <p className="text-center text-sm">
          Não possui conta?{' '}
          <a href="/pages/cadastro" className="text-blue-600 hover:underline">Cadastrar-se</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
