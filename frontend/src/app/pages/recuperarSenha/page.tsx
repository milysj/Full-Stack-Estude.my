'use client';

import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Image from 'next/image';

const RecuperarSenha = () => {
  const [passo, setPasso] = useState(1); // 1 = solicitar token, 2 = redefinir senha
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarToken, setMostrarToken] = useState(false);

  // Função de validação de senha
  const validarSenha = (senha) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
  };

  // Solicitar token
  const solicitarToken = async () => {
    setErro('');
    setSucesso('');
    try {
      const res = await fetch('http://localhost:8080/api/usuarios/solicitar-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSucesso(data.mensagem || 'Token enviado com sucesso! Confira seu e-mail.');
        setToken(data.token || ''); // Em produção, não exibir token
        setPasso(2);
      } else {
        setErro(data.mensagem || 'Erro ao solicitar token');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor.');
      console.error(error);
    }
  };

  // Redefinir senha
  const redefinirSenha = async () => {
    setErro('');
    setSucesso('');

    if (!validarSenha(novaSenha)) {
      setErro(
        'Senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.'
      );
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/usuarios/reset-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await res.json();

      if (res.ok) {
        setSucesso(data.mensagem || 'Senha redefinida com sucesso!');
        setPasso(1);
        setEmail('');
        setToken('');
        setNovaSenha('');
      } else {
        setErro(data.mensagem || 'Erro ao redefinir senha');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor.');
      console.error(error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
      style={{ backgroundImage: `url('/img/background-image-login-register.png')`, backgroundSize: 'cover' }}
    >
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <Image width={400} height={128} src="/svg/EstudeMyLogo.svg" alt="Logo" className="ml-11" />
        </div>

        <form className="flex flex-col gap-3">
          {passo === 1 && (
            <>
              <label className="text-sm text-left">Digite seu e-mail:</label>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                className="rounded-lg py-2 px-3 text-sm border border-gray-300 w-full"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {erro && <p className="text-red-600 text-sm">{erro}</p>}
              {sucesso && <p className="text-green-600 text-sm">{sucesso}</p>}
              <Button type="button" variant="primary" onClick={solicitarToken}>
                Solicitar token
              </Button>
            </>
          )}

          {passo === 2 && (
            <>
              <label className="text-sm text-left">Token:</label>
              <div className="relative">
                <input
                  type={mostrarToken ? 'text' : 'password'}
                  placeholder="Digite o token"
                  className="w-full rounded-lg py-2 px-4 pr-10 text-sm border border-gray-300 bg-blue-100"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarToken(!mostrarToken)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
                >
                  {mostrarToken ? '🙈' : '👁️'}
                </button>
              </div>

              <label className="text-sm text-left mt-2">Nova senha:</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  className="w-full rounded-lg py-2 px-4 pr-10 text-sm border border-gray-300 bg-blue-100"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
                >
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>

              {erro && <p className="text-red-600 text-sm">{erro}</p>}
              {sucesso && <p className="text-green-600 text-sm">{sucesso}</p>}

              <Button type="button" variant="primary" onClick={redefinirSenha}>
                Redefinir senha
              </Button>
            </>
          )}

          <p className="text-center text-sm mt-2">
            <a href="/pages/login" className="text-blue-600 hover:underline">
              Voltar ao login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RecuperarSenha;
