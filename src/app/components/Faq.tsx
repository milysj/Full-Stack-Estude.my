const Faq = () => {
    return (
      // Container principal com largura máxima, padding e borda arredondada
      <div className="flex items-center justify-center px-35 py-4 m-auto mx-5">
        {/* ===============================
          Card principal da conta
          =============================== */}
        <div className="bg-white p-6 rounded shadow-md w-full mx-auto">
          {/* Seção 1 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              O que é a plataforma gamificada?
            </h2>
            <p className="text-gray-700">
              Nossa plataforma é um ambiente de aprendizado interativo que
              utiliza elementos de jogos, como pontos, conquistas e desafios,
              para motivar os alunos a aprender. Professores criam trilhas
              personalizadas para engajar os estudantes.
            </p>
          </section>

          {/* Seção 2 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Como os professores criam trilhas?
            </h2>
            <p className="text-gray-700">
              Os professores têm acesso a um painel exclusivo, onde podem criar
              módulos de aprendizado, adicionar atividades, vídeos, quizzes e
              configurar níveis de dificuldade. As trilhas podem ser adaptadas
              para diferentes objetivos e estilos de ensino.
            </p>
          </section>

          {/* Seção 3 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Os alunos ganham recompensas?
            </h2>
            <p className="text-gray-700">
              Sim! Os alunos ganham pontos ao completar atividades, podem
              desbloquear conquistas e avançar em um sistema de níveis. Isso os
              incentiva a continuar aprendendo enquanto se divertem.
            </p>
          </section>

          {/* Seção 4 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Quais disciplinas podem ser ensinadas?
            </h2>
            <p className="text-gray-700">
              A plataforma suporta qualquer disciplina! Professores podem criar
              trilhas em matemática, ciências, idiomas, história, entre outras.
              O conteúdo é totalmente personalizável.
            </p>
          </section>

          {/* Seção 5 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              É necessário pagar para usar a plataforma?
            </h2>
            <p className="text-gray-700">
              A plataforma possui um plano gratuito com recursos básicos e
              planos premium que oferecem funcionalidades adicionais, como
              relatórios avançados, suporte prioritário e ferramentas de
              personalização.
            </p>
          </section>
        </div>
      </div>
    );
};

export default Faq;
