"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import {
  Navbar,
  Nav,
  Container,
  Form,
  Button,
  FormControl,
} from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  List,
  Book,
  BarChart,
  BookmarkFill,
  // Envelope,
  BackpackFill,
  HouseDoor,
  Person,
  // ThreeDots,
  // Gear,
  Search,
  ArrowLeft, // NOVO: Ícone para fechar a pesquisa mobile
  // Cart,
} from "react-bootstrap-icons";

// Componente principal do topo/navegação
const Topo = () => {
  // Estados para controlar o comportamento do menu lateral e navbar
  const [collapsed, setCollapsed] = useState(true); // Sidebar recolhida ou não
  const [sidebarToggled, setSidebarToggled] = useState(false); // Sidebar aberta no mobile
  const [navbarToggled, setNavbarToggled] = useState(false); // Navbar aberta no mobile
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown "Mais" visível
  const [isMobile, setIsMobile] = useState(false); // Se está em tela mobile

  // Estado para a barra de pesquisa
  const [searchTerm, setSearchTerm] = useState("");

  // NOVO: Estado para controlar a barra de pesquisa no mobile
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const router = useRouter();

  // Função para fazer logout
  const handleLogout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    // Remover token do localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    // Redirecionar para login
    router.push("/pages/login");
    // Forçar reload para limpar estado
    setTimeout(() => {
      window.location.href = "/pages/login";
    }, 100);
  };

  // Função para lidar com a pesquisa
  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Impede o recarregamento da página
    if (searchTerm.trim() !== "") {
      // Aqui você faria a lógica de pesquisa:
      // Ex: Router.push(`/search?q=${searchTerm}`);
      console.log("Pesquisando por:", searchTerm);
      // Opcional: Limpar o campo após a pesquisa
      // setSearchTerm("");
      // Opcional: Fechar a barra de pesquisa móvel após pesquisar
      // if (isMobile) {
      //   setMobileSearchOpen(false);
      // }
    }
  };
  // Hook para detectar se está em tela mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Dados dos menus laterais (sidebar)
  const sidebarItems = [
    {
      icon: <Book size={18} />,
      label: "Meus Cursos",
      href: "/pages/meusCursos",
    },
    { icon: <BarChart size={18} />, label: "Ranking", href: "/pages/ranking" },
    {
      icon: <BookmarkFill size={18} />,
      label: "Lições Salvas",
      href: "/pages/salvas",
    },
    // {
    //   icon: <Envelope size={18} />,
    //   label: "Caixa de Entrada",
    //   href: "/pages/mensagens",
    // },
    {
      icon: <BackpackFill size={18} />,
      label: "Gerenciar Trilhas",
      href: "/pages/gerenciarTrilha",
    },
    // {
    //   icon: <Cart size={18} />,
    //   label: "Loja",
    //   href: "/pages/loja",
    // },
  ];

  // Dados dos menus superiores (navbar)
  const navItems = [
    {
      href: "/pages/home",
      icon: <HouseDoor size={20} />,
      label: "Home",
    },
  ];

  // Itens do dropdown "Perfil"
  const dropdownItems = [
    { href: "/pages/perfil", icon: <Person size={20} />, label: "Perfil" },
    { href: "/pages/configuracoes", label: "Configurações" },
    { href: "#", label: "Sair", variant: "danger", onClick: handleLogout },
  ];

  // Fecha o sidebar ao clicar em um link no mobile
  const handleSidebarLinkClick = () => {
    if (isMobile) {
      setSidebarToggled(false);
    }
  };

  return (
    <div className="flex">
      {/* Botão para abrir o sidebar no mobile */}
      {isMobile && (
        <button
          onClick={() => setSidebarToggled(!sidebarToggled)}
          style={{
            position: "fixed",
            top: "8px",
            left: "8px",
            zIndex: 1100,
            background: "#00a2ff",
            border: "none",
            borderRadius: "6px",
            padding: "6px 8px",
            color: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            transition: "margin-left 0.3s",
            minHeight: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Toggle Sidebar"
        >
          <List size={16} />
        </button>
      )}
      {/* Fundo escuro ao abrir o sidebar no mobile */}
      {isMobile && sidebarToggled && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={() => setSidebarToggled(false)}
        />
      )}
      {/* Sidebar lateral (menu principal) */}
      <Sidebar
        collapsed={isMobile ? false : collapsed}
        toggled={false}
        onMouseEnter={() => !isMobile && setCollapsed(false)}
        onMouseLeave={() => !isMobile && setCollapsed(true)}
        width={isMobile ? "280px" : "280px"}
        rootStyles={{
          height: "100vh",
          position: "fixed",
          zIndex: 1000,
          backgroundColor: "#007aff",
          overflow: "hidden",
          transform:
            isMobile && !sidebarToggled ? "translateX(-100%)" : "translateX(0)",
          transition: "transform margin-left 0.3s",
          "& > div": {
            backgroundColor: "#007aff",
            overflow: "hidden !important",
            "& ul": {
              height: "100%",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Menu do sidebar */}
        <Menu
          menuItemStyles={{
            button: {
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#0063cc",
                transform: "scale(0.95)",
              },
            },
          }}
        >
          {/* Item do menu para expandir/recolher */}

          <div
            style={{
              marginTop: "50px",
            }}
          >
            {/* Lista dos itens do menu lateral */}
            <div
              style={{
                height: "calc(100vh - 120px)",
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
            >
              {sidebarItems.map((item, index) => (
                <MenuItem
                  key={index}
                  icon={<div className="text-white">{item.icon}</div>}
                  component={<Link href={item.href} />}
                  onClick={handleSidebarLinkClick}
                  style={{
                    padding: "8px 15px",
                    color: "white",
                  }}
                >
                  {(!collapsed || isMobile) && item.label}
                </MenuItem>
              ))}
            </div>
          </div>

          {/* Item fixo no final do sidebar (ConsultAI) */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              backgroundColor: "#007aff",
            }}
          >
            <MenuItem
              icon={
                <div className="w-6 h-6 relative">
                  <Image
                    width={24}
                    height={24}
                    src="/img/ConsultAi.png"
                    alt="ConsultAI"
                    className="object-contain"
                    sizes="24px"
                  />
                </div>
              }
              component={<Link href="/pages/consultAi" />}
              onClick={handleSidebarLinkClick}
              style={{
                padding: "8px 15px",
                color: "white",
              }}
            >
              {(!collapsed || isMobile) && "ConsultAI"}
            </MenuItem>
          </div>
        </Menu>
      </Sidebar>

      {/* Conteúdo principal e navbar superior */}
      <div
        style={{
          marginLeft: isMobile ? "0px" : collapsed ? "0px" : "00px",
          transition: "margin-left 0.3s",
          width: "100%",
        }}
      >
        {/* Navbar superior */}
        <Navbar
          expand="lg"
          className="menu-central"
          style={{
            minHeight: isMobile ? "48px" : "auto",
            padding: isMobile ? "4px 0" : "8px 0",
          }}
        >
          <Container
            fluid
            className="px-0"
            style={{
              minHeight: isMobile ? "40px" : "auto",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Logo do sistema - ALTERADO: Esconde se a pesquisa mobile estiver aberta */}
            {(!isMobile || (isMobile && !mobileSearchOpen)) && (
              <Link href="/pages/home">
                <div
                  style={{
                    marginLeft: isMobile ? "80px" : "80px",
                    transition: "margin-left 0.3s",
                    display: "flex",
                    alignItems: "center",
                    height: isMobile ? "32px" : "auto",
                  }}
                >
                  <div
                    style={{
                      transform: isMobile ? "scale(0.7)" : "scale(1)",
                      transformOrigin: "left center",
                    }}
                  >
                    {/* Logo */}
                    <div className="mb-6 text-center my-1">
                      <Image
                        width={350}
                        height={128}
                        src="/svg/EstudeMyLogo.svg"
                        alt="Logo"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Barra de Pesquisa (Desktop) - ALTERADO: Renderização condicional */}
            {!isMobile && (
              <Form
                className="d-flex my-2 my-lg-0 me-auto ms-lg-4"
                onSubmit={handleSearchSubmit}
                style={{ flexGrow: 0.5, maxWidth: "450px" }}
              >
                <FormControl
                  type="search"
                  placeholder="Pesquisar lições, trilhas..."
                  className="me-2"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ height: "38px" }}
                />
                <Button
                  variant="outline-primary"
                  type="submit"
                  style={{
                    height: "38px",
                    padding: "6px 12px",
                  }}
                >
                  <Search size={18} />
                </Button>
              </Form>
            )}

            {/* NOVO: Barra de Pesquisa (Mobile - Aberta) */}
            {isMobile && mobileSearchOpen && (
              <Form
                className="d-flex flex-grow-1"
                onSubmit={handleSearchSubmit}
                style={{ marginLeft: "80px", marginRight: "15px" }}
              >
                {/* Botão de fechar */}
                <Button
                  variant="link"
                  onClick={() => setMobileSearchOpen(false)}
                  className="text-dark p-2"
                  aria-label="Fechar pesquisa"
                >
                  <ArrowLeft size={18} />
                </Button>
                <FormControl
                  type="search"
                  placeholder="Pesquisar..."
                  className="me-2"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ height: "32px" }} // CORRIGIDO: de 300px para 32px
                  autoFocus // Foca no input ao abrir
                />
                <Button
                  variant="outline-primary"
                  type="submit"
                  style={{
                    height: "32px",
                    padding: "4px 8px",
                  }}
                >
                  <Search size={16} />
                </Button>
              </Form>
            )}

            {/* Controles da Direita (Mobile) - ALTERADO: Esconde se a pesquisa mobile estiver aberta */}
            {isMobile && !mobileSearchOpen && (
              <div className="d-flex align-items-center ms-auto">
                {/* NOVO: Botão Ícone de Pesquisa (Mobile - Fechado) */}
                <Button
                  variant="link"
                  onClick={() => setMobileSearchOpen(true)}
                  className="text-dark p-2"
                  style={{ marginRight: "8px" }}
                  aria-label="Abrir pesquisa"
                >
                  <Search size={20} />
                </Button>

                {/* Botão para abrir navbar no mobile */}
                <Navbar.Toggle
                  aria-controls="top-navbar"
                  onClick={() => setNavbarToggled(!navbarToggled)}
                  className="border-0 me-3"
                  style={{
                    padding: isMobile ? "2px 4px" : "4px 8px",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                  }}
                >
                  <span className="navbar-toggler-icon"></span>
                </Navbar.Toggle>
              </div>
            )}

            {/* Itens do menu superior - ALTERADO: Esconde se a pesquisa mobile estiver aberta */}
            {(!isMobile || (isMobile && !mobileSearchOpen)) && (
              <Navbar.Collapse id="top-navbar" className="justify-content-end">
                <Nav
                  as="ul"
                  className="item-menu-central"
                  style={{
                    alignItems: "center",
                  }}
                >
                  {/* Itens principais do menu */}
                  {navItems.map((item, index) => (
                    <Nav.Item as="li" key={index}>
                      <Link href={item.href}>
                        <Nav.Link
                          as="span" // Evita <a> aninhado
                          className="d-flex align-items-center"
                          onClick={() => setNavbarToggled(false)}
                          style={{
                            padding: isMobile ? "4px 8px" : "8px 12px",
                            fontSize: isMobile ? "0.85rem" : "1rem",
                            minHeight: isMobile ? "32px" : "auto",
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                        >
                          {/* Ícone do item */}
                          {React.cloneElement(item.icon, {
                            className: "me-1",
                            size: isMobile ? 16 : 18,
                          })}
                          {item.label}
                        </Nav.Link>
                      </Link>
                    </Nav.Item>
                  ))}

                  {/* Dropdown "Perfil" (aparece só no desktop) */}
                  {!isMobile && (
                    <Nav.Item as="li" className="dropdown-container">
                      <div
                        className="dropdown-toggle"
                        onMouseEnter={() => setShowDropdown(true)}
                        onMouseLeave={() => setShowDropdown(false)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center nav-link2">
                          <Person className="me-2" />
                        </div>

                        {/* Itens do dropdown */}
                        {showDropdown && (
                          <div className="custom-dropdown">
                            {dropdownItems.map((item, index) =>
                              item.onClick ? (
                                <a
                                  href="#"
                                  key={index}
                                  className={`dropdown-item ${
                                    item.variant === "danger"
                                      ? "text-danger"
                                      : ""
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setShowDropdown(false);
                                    item.onClick?.(e);
                                  }}
                                  style={{ cursor: "pointer" }}
                                >
                                  {item.label}
                                </a>
                              ) : (
                                <Link
                                  href={item.href}
                                  key={index}
                                  className={`dropdown-item ${
                                    item.variant === "danger"
                                      ? "text-danger"
                                      : ""
                                  }`}
                                  onClick={() => setShowDropdown(false)}
                                >
                                  {item.label}
                                </Link>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </Nav.Item>
                  )}

                  {/* Itens do dropdown "Mais" (aparecem direto no mobile) */}
                  {isMobile &&
                    dropdownItems.map((item, index) => (
                      <Nav.Item as="li" key={`mobile-${index}`}>
                        {item.onClick ? (
                          <Nav.Link
                            as="span" // Evita <a> aninhado
                            className={`d-flex align-items-center ${
                              item.variant === "danger" ? "text-danger" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              setNavbarToggled(false);
                              item.onClick?.(e);
                            }}
                            style={{
                              padding: isMobile ? "4px 8px" : "8px 12px",
                              fontSize: isMobile ? "0.85rem" : "1rem",
                              minHeight: isMobile ? "32px" : "auto",
                              cursor: "pointer",
                            }}
                          >
                            {item.label}
                          </Nav.Link>
                        ) : (
                          <Link href={item.href}>
                            <Nav.Link
                              as="span" // Evita <a> aninhado
                              className={`d-flex align-items-center ${
                                item.variant === "danger" ? "text-danger" : ""
                              }`}
                              onClick={() => setNavbarToggled(false)}
                              style={{
                                padding: isMobile ? "4px 8px" : "8px 12px",
                                fontSize: isMobile ? "0.85rem" : "1rem",
                                minHeight: isMobile ? "32px" : "auto",
                                cursor: "pointer",
                              }}
                            >
                              {item.label}
                            </Nav.Link>
                          </Link>
                        )}
                      </Nav.Item>
                    ))}
                </Nav>
              </Navbar.Collapse>
            )}
          </Container>
        </Navbar>
      </div>
    </div>
  );
};

export default Topo;
