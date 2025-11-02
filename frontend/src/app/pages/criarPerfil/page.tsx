"use client";

import { useState } from "react";
import Image from "next/image";

export default function CriarPerfil() {
  const [personagem, setPersonagem] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<File | string | null>(null); // Pode ser URL ou arquivo
  const [preview, setPreview] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");

  const personagens = [
    { nome: "Guerreiro", imagem: "/img/guerreiro.png" },
    { nome: "Mago", imagem: "/img/mago.png" },
    { nome: "Samurai", imagem: "/img/samurai.png" },
  ];

  const fotosPreDefinidas = [
    "/img/guerreiro.png",
    "/img/mago.png",
    "/img/samurai.png",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoPerfil(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePreDefinidaClick = (url: string) => {
    setFotoPerfil(url);
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personagem || !username || !fotoPerfil) {
      setMensagem("⚠️ Personagem, username e foto de perfil são obrigatórios!");
      return;
    }

    const formData = new FormData();
    formData.append("personagem", personagem);
    formData.append("username", username);

    if (fotoPerfil instanceof File) {
      formData.append("fotoPerfil", fotoPerfil);
    } else if (typeof fotoPerfil === "string") {
      formData.append("fotoPerfil", fotoPerfil);
    }

    try {
      const token = localStorage.getItem("token");
      console.log("🔑 Token enviado:", token);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const resposta = await fetch(`${API_URL}/api/criarPerfil`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await resposta.json();

      if (resposta.ok) {
        setMensagem("✅ Perfil criado com sucesso!");
        setTimeout(() => {
          window.location.href = "/pages/home";
        }, 1500);
      } else {
        setMensagem(data.message || "❌ Erro ao criar perfil.");
      }
    } catch (error) {
      console.error(error);
      setMensagem("❌ Erro de conexão. Tente novamente.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/img/background.jpg')" }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🎮 Criar Perfil
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Escolha de personagem */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Escolha seu personagem
            </h2>
            <div className="flex justify-center gap-8">
              {personagens.map((p) => (
                <div
                  key={p.nome}
                  onClick={() => setPersonagem(p.nome)}
                  className={`cursor-pointer rounded-xl border-4 transition-transform transform hover:scale-105 ${
                    personagem === p.nome
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={p.imagem}
                    alt={p.nome}
                    width={100}
                    height={100}
                    className="rounded-xl"
                  />
                  <p
                    className={`mt-2 font-medium ${
                      personagem === p.nome ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {p.nome}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-left text-gray-700 font-medium mb-1">
              Nome de usuário:
            </label>
            <input
              type="text"
              placeholder="Digite seu username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Escolha de foto */}
          <div>
            <label className="block text-left text-gray-700 font-medium mb-1">
              Escolha sua foto de perfil ou faça upload:
            </label>
            <div className="flex gap-4 mb-2 justify-center">
              {fotosPreDefinidas.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="pré-definida"
                  width={60}
                  height={60}
                  className={`cursor-pointer rounded-full border-2 ${
                    fotoPerfil === url ? "border-blue-600" : "border-gray-300"
                  }`}
                  onClick={() => handlePreDefinidaClick(url)}
                />
              ))}
            </div>

            <label className="cursor-pointer inline-block w-full text-center py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300">
              Selecionar arquivo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {preview && (
              <div className="mt-4 flex justify-center">
                <Image
                  src={preview}
                  alt="Prévia"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-blue-400"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Criar Perfil
          </button>

          {mensagem && (
            <p className="text-center text-sm font-medium mt-3 text-gray-700">
              {mensagem}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
