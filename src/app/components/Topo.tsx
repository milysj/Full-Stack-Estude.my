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
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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
  Gear,
  Search,
  ArrowLeft, // NOVO: Ícone para fechar a pesquisa mobile
  ChevronDown,
  // Cart,
} from "react-bootstrap-icons";

// Componente principal do topo/navegação
const Topo = () => {
  // Estados para controlar o comportamento do menu lateral e navbar
  const [collapsed, setCollapsed] = useState(true); // Sidebar recolhida ou não
  const [sidebarToggled, setSidebarToggled] = useState(false); // Sidebar aberta no mobile
  const [navbarToggled, setNavbarToggled] = useState(false); // Navbar aberta no mobile
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
  const handleSearchSubmit = (event: React.FormEvent) => {
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
    {
      href: "/pages/ranking",
      icon: <BarChart size={20} />,
      label: "Ranking",
    },
  ];

  // Itens do dropdown "Perfil" (incluindo itens da sidebar)
  const dropdownItems: Array<{
    href: string;
    icon?: React.ReactNode;
    label: string;
    variant?: string;
    onClick?: (e?: React.MouseEvent) => void;
    separator?: boolean; // Indica se deve ter separador antes deste item
  }> = [
    { href: "/pages/perfil", icon: <Person size={18} />, label: "Perfil" },
    { href: "/pages/configuracoes", icon: <Gear size={18} />, label: "Configurações" },
    { href: "/pages/meusCursos", icon: <Book size={18} />, label: "Meus Cursos", separator: true },
    { href: "/pages/salvas", icon: <BookmarkFill size={18} />, label: "Lições Salvas" },
    { href: "/pages/gerenciarTrilha", icon: <BackpackFill size={18} />, label: "Gerenciar Trilhas" },
    { 
      href: "/pages/consultAi", 
      icon: (
        <div style={{ width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Image
            width={18}
            height={18}
            src="/img/ConsultAi.png"
            alt="ConsultAI"
            style={{ objectFit: "contain" }}
          />
        </div>
      ), 
      label: "ConsultAI" 
    },
    { href: "#", label: "Sair", variant: "danger", onClick: handleLogout, separator: true },
  ];

  // Fecha o sidebar ao clicar em um link no mobile
  const handleSidebarLinkClick = () => {
    if (isMobile) {
      setSidebarToggled(false);
    }
  };

  return (
    <div className="flex">
      {/* SIDEBAR COMENTADA - Conteúdos movidos para o dropdown */}
      {/* Botão para abrir o sidebar no mobile */}
      {/* {isMobile && (
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
      )} */}
      {/* Fundo escuro ao abrir o sidebar no mobile */}
      {/* {isMobile && sidebarToggled && (
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
      )} */}
      {/* Sidebar lateral (menu principal) - COMENTADA */}
      {/* 
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
          <div
            style={{
              marginTop: "50px",
            }}
          >
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
      */}

      {/* Conteúdo principal e navbar superior */}
      <div
        style={{
          marginLeft: "0px", // Sidebar removida, não precisa mais de margem
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
            display: "flex",
            alignItems: "center",
          }}
        >
          <Container
            fluid
            className="px-0"
            style={{
              minHeight: isMobile ? "40px" : "auto",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            {/* Logo do sistema - ALTERADO: Esconde se a pesquisa mobile estiver aberta */}
            {(!isMobile || (isMobile && !mobileSearchOpen)) && (
              <Link
                href="/pages/home"
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    marginLeft: isMobile ? "15px" : "20px", // Ajustado pois não há mais sidebar
                    transition: "margin-left 0.3s",
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      transform: isMobile ? "scale(1)" : "scale(1.5)",
                      transformOrigin: "left center",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* Logo */}
                    <div>
                      <Image
                        width={200}
                        height={128}
                        src="/svg/EstudeMyLogo.svg"
                        alt="Logo"
                        style={{ display: "block" }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Barra de Pesquisa (Desktop) - ALTERADO: Renderização condicional */}
            {!isMobile && (
              <Form
                className="d-flex my-2 my-lg-0 me-auto ms-lg-4 px-auto alli"
                onSubmit={handleSearchSubmit}
                style={{ flexGrow: 0.5, maxWidth: "900px" }}
              >
                <FormControl
                  type="search"
                  placeholder="Pesquisar lições, trilhas..."
                  className="me-2"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    height: "38px",
                    marginLeft: "80px", // Ajustado pois não há mais sidebar
                  }}
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

                  {/* Dropdown "Perfil" (aparece só no desktop) - Usando Radix UI */}
                  {!isMobile && (
                    <Nav.Item as="li">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            className="d-flex align-items-center nav-link2 border-0 bg-transparent"
                            style={{
                              padding: "10px 15px",
                              cursor: "pointer",
                              color: "inherit",
                            }}
                            aria-label="Menu do perfil"
                          >
                            <Person className="me-2" size={20} />
                            <ChevronDown size={14} style={{ marginLeft: "4px" }} />
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            sideOffset={5}
                            align="end"
                            className="radix-dropdown-content"
                            style={{
                              backgroundColor: "white",
                              borderRadius: "6px",
                              padding: "4px",
                              minWidth: "200px",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              border: "1px solid #e5e7eb",
                              zIndex: 1000,
                            }}
                          >
                            {dropdownItems.map((item, index) => (
                              <React.Fragment key={index}>
                                {item.separator && index > 0 && (
                                  <DropdownMenu.Separator
                                    style={{
                                      height: "1px",
                                      backgroundColor: "#e5e7eb",
                                      margin: "4px 0",
                                    }}
                                  />
                                )}
                                {item.onClick ? (
                                  <DropdownMenu.Item
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      padding: "8px 12px",
                                      fontSize: "14px",
                                      cursor: "pointer",
                                      outline: "none",
                                      borderRadius: "4px",
                                      color: item.variant === "danger" ? "#dc3545" : "#333",
                                    }}
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      item.onClick?.(e as any);
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        item.variant === "danger" ? "#fee2e2" : "#e0f2fe";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    {item.icon && (
                                      <span
                                        style={{
                                          marginRight: "8px",
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        {item.icon}
                                      </span>
                                    )}
                                    {item.label}
                                  </DropdownMenu.Item>
                                ) : (
                                  <DropdownMenu.Item asChild>
                                    <Link
                                      href={item.href}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "8px 12px",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        textDecoration: "none",
                                        color: item.variant === "danger" ? "#dc3545" : "#333",
                                        borderRadius: "4px",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          item.variant === "danger" ? "#fee2e2" : "#e0f2fe";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                      }}
                                    >
                                      {item.icon && (
                                        <span
                                          style={{
                                            marginRight: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          {item.icon}
                                        </span>
                                      )}
                                      {item.label}
                                    </Link>
                                  </DropdownMenu.Item>
                                )}
                              </React.Fragment>
                            ))}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </Nav.Item>
                  )}

                  {/* Itens do dropdown "Mais" (aparecem direto no mobile) */}
                  {isMobile &&
                    dropdownItems.map((item, index) => (
                      <React.Fragment key={`mobile-${index}`}>
                        {item.separator && index > 0 && (
                          <Nav.Item as="li">
                            <div
                              style={{
                                height: "1px",
                                backgroundColor: "#e5e7eb",
                                margin: "8px 0",
                              }}
                            />
                          </Nav.Item>
                        )}
                        <Nav.Item as="li">
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
                              {item.icon && <span className="me-2">{item.icon}</span>}
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
                                {item.icon && <span className="me-2">{item.icon}</span>}
                                {item.label}
                              </Nav.Link>
                            </Link>
                          )}
                        </Nav.Item>
                      </React.Fragment>
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
