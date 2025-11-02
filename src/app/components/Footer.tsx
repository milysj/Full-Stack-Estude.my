const Footer = () => {
    return (
        // Footer com fundo escuro e texto cinza, padding vertical
        <footer className="bg-slate-700 text-gray-700 py-6 mt-8 align-bottom">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">

                {/* Copyright */}
                <div className="text-lg font-semibold">
                    ConsultAi © {new Date().getFullYear()}
                </div>

                {/* Redes sociais */}
                <div className="flex flex-row-reverse gap-3">
                    <a
                        href="https://github.com/Lupateli/EstudeMy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors"
                    >
                        Github
                    </a>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
