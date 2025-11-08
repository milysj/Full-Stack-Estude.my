"use client";
import { Link } from "lucide-react";
import React, { useState } from "react";

// ===============================
// Componente de Configurações do usuário
// ===============================
export default function Configuracoes() {
  // ===============================
  // Estado do formulário
  // ===============================
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    notifications: false,
    publicProfile: false,
    theme: "Claro",
  });

  // ===============================
  // Interface TypeScript para o estado
  // ===============================
  interface FormData {
    username: string;
    email: string;
    notifications: boolean;
    publicProfile: boolean;
    theme: string;
  }

  // ===============================
  // Atualiza o estado quando o usuário altera inputs ou selects
  // ===============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev: FormData) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, // usa checked para checkbox, value para inputs/selects
    }));
  };

  // ===============================
  // Manipula o submit do formulário
  // ===============================
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault(); // evita reload da página
    alert("Alterações salvas!");
    console.log(formData); // aqui você poderia enviar para uma API
  };

  return (
    <div className="flex items-center justify-center p-4 m-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow-md p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Configurações</h2>
        <div className="mb-4">
          <button type="button" onClick={() => window.location.href="/pages/faq"} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            FAQ
          </button>
          <button type="button" onClick={() => window.location.href="/pages/faleConosco"} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 my-2">
            Fale Conosco
          </button>
        </div>

        {/* ===============================
            Seção Privacidade
        =============================== */}
        <div className="mb-4">
          <h3 className=" font-semibold border-b pb-1 mb-2">Privacidade</h3>
          <label className="block mb-2">
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="mr-2"
            />
            Receber notificações
          </label>
          <label className="block mx-2 mt-6">
            <input
              type="checkbox"
              name="publicProfile"
              checked={formData.publicProfile}
              onChange={handleChange}
              className="mr-2"
            />
            Tornar perfil público
          </label>
        </div>

        {/* ===============================
            Seção Tema
        =============================== */}
        {/* <div className="mb-4">
          <h3 className="font-semibold border-b pb-1 mb-2">Tema</h3>
          <label className="block">
            Escolha o tema:
            <select
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="Claro">Claro</option>
              <option value="Escuro">Escuro</option>
            </select>
          </label>
        </div> */}

        {/* Botão de submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Salvar alterações
        </button>
      </form>
    </div>
  );
}
