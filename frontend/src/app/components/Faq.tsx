const Faq = () => {
    return (
      // Container principal com largura máxima, padding responsivo e borda arredondada
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 w-full">
        {/* ===============================
          Card principal da FAQ
          =============================== */}
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded shadow-md w-full max-w-4xl mx-auto">
          {/* Seção 1 */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words">
              O que é a plataforma gamificada?
            </h2>
            <p className="text-gray-700 text-sm sm:text-base break-words leading-relaxed">
              Nossa plataforma é um ambiente de aprendizado interativo que
              utiliza elementos de jogos, como pontos, conquistas e desafios,
              para motivar os alunos a aprender. Professores criam trilhas
              personalizadas para engajar os estudantes.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words">
              Como os professores criam trilhas?
            </h2>
            <p className="text-gray-700 text-sm sm:text-base break-words leading-relaxed">
              Os professores têm acesso a um painel exclusivo, onde podem criar
              módulos de aprendizado, adicionar atividades, vídeos, quizzes e
              configurar níveis de dificuldade. As trilhas podem ser adaptadas
              para diferentes objetivos e estilos de ensino.
            </p>
          </section>

          {/* Seção 3 */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words">
              Os alunos ganham recompensas?
            </h2>
            <p className="text-gray-700 text-sm sm:text-base break-words leading-relaxed">
              Sim! Os alunos ganham pontos ao completar atividades, podem
              desbloquear conquistas e avançar em um sistema de níveis. Isso os
              incentiva a continuar aprendendo enquanto se divertem.
            </p>
          </section>

          {/* Seção 4 */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words">
              Quais disciplinas podem ser ensinadas?
            </h2>
            <p className="text-gray-700 text-sm sm:text-base break-words leading-relaxed">
              A plataforma suporta qualquer disciplina! Professores podem criar
              trilhas em matemática, ciências, idiomas, história, entre outras.
              O conteúdo é totalmente personalizável.
            </p>
          </section>

          {/* Seção 5 */}
          <section className="mb-6 sm:mb-8 last:mb-0">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words">
              É necessário pagar para usar a plataforma?
            </h2>
            <p className="text-gray-700 text-sm sm:text-base break-words leading-relaxed">
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
