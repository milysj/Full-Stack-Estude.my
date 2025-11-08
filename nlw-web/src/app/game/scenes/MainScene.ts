import * as Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  jogadorHP = 100;
  jogadorMana = 100;
  inimigoHP = 100;
  inimigoMana = 100;

  player!: Phaser.GameObjects.Sprite;
  enemy!: Phaser.GameObjects.Sprite;

  jogadorBalao!: Phaser.GameObjects.Container;
  inimigoBalao!: Phaser.GameObjects.Container;

  balaoPergunta!: Phaser.GameObjects.Graphics;
  perguntaText!: Phaser.GameObjects.Text;
  opcoes: Phaser.GameObjects.Text[] = [];

  acaoContainer!: Phaser.GameObjects.Container;
  specialMeter: Phaser.GameObjects.Graphics[] = [];
  specialValue = 0;

  perguntaAtual: any;

  perguntas = [
    { pergunta: "Qual é a capital do Brasil?", opcoes: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador", "Fortaleza"], resposta: "Brasília" },
    { pergunta: "Qual é 2 + 2?", opcoes: ["3", "4", "5", "6", "7"], resposta: "4" },
    { pergunta: "Qual é a cor do céu?", opcoes: ["Verde", "Azul", "Vermelho", "Amarelo", "Preto"], resposta: "Azul" },
  ];

  readonly LETRAS = ["A", "B", "C", "D", "E"];

  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.image("background", "/img/background-image-login-register.png");
    this.load.image("player", "/img/pixel_art_small (1).png");
    this.load.image("enemy", "/img/cavaleiro_inimigo.png");
  }

  get layout() {
    const { width, height } = this.scale;
    return {
      balaoX: width * 0.1,
      balaoY: height * 0.05,
      balaoWidth: width * 0.8,
      balaoHeight: height * 0.25,
      padding: 20,
      opcoesGap: 40,
      fontSize: Math.round(width * 0.02),
      btnFontSize: Math.round(width * 0.025),
      infoWidth: 150,
      infoHeight: 60,
      infoPadding: 8,
      barraHeight: 10,
      acaoWidth: 320,
      acaoHeight: 80,
      acaoPadding: 10,
      specialGap: 8,
    };
  }

  create() {
    this.createBackground();
    this.createSprites();
    this.criarBaloesInfo();
    this.createPerguntaBalao();
    this.loadPergunta();
    this.criarBalaoAcoes();
    this.criarBotaoVoltar();

    this.scale.on("resize", () => {
      this.reposicionarSprites();
      this.atualizarBaloesInfo();
      this.reposicionarBalao();
      this.reposicionarAcoes();
      if (this.perguntaAtual) this.renderOpcoes(this.perguntaAtual.opcoes);
    });
  }

  // ---------------- Background e Sprites ----------------
  createBackground() {
    const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
    bg.setDisplaySize(this.scale.width, this.scale.height);
  }

  createSprites() {
    const { width, height } = this.scale;
    this.player = this.add.sprite(width * 0.2, height * 0.8, "player").setOrigin(0.5, 1).setScale(width / 2000);
    this.enemy = this.add.sprite(width * 0.8, height * 0.8, "enemy").setOrigin(0.5, 1).setScale(width / 3000);
  }

  reposicionarSprites() {
    const { width, height } = this.scale;
    this.player.setPosition(width * 0.2, height * 0.8);
    this.enemy.setPosition(width * 0.8, height * 0.8);
  }

  // ---------------- Balões de Info ----------------
  criarBaloesInfo() {
    this.jogadorBalao = this.criarBalaoInfo(this.player, "Jogador", () => this.jogadorHP, () => this.jogadorMana);
    this.inimigoBalao = this.criarBalaoInfo(this.enemy, "Inimigo", () => this.inimigoHP, () => this.inimigoMana);
    this.jogadorBalao.setDepth(10);
    this.inimigoBalao.setDepth(10);
  }

  criarBalaoInfo(sprite: Phaser.GameObjects.Sprite, nome: string, hpFn: () => number, manaFn: () => number) {
    const l = this.layout;
    const container = this.add.container(sprite.x, sprite.y - sprite.displayHeight - 20);

    const balao = this.add.graphics();
    balao.fillStyle(0x222222, 0.85);
    balao.fillRoundedRect(-l.infoWidth / 2, 0, l.infoWidth, l.infoHeight, 8);

    const nomeText = this.add.text(0, l.infoPadding, nome, { fontSize: `${l.fontSize}px`, color: "#fff" }).setOrigin(0.5, 0);
    const hpBar = this.add.graphics();
    const manaBar = this.add.graphics();
    const hpText = this.add.text(0, l.infoPadding + l.barraHeight + 2, "", { fontSize: `${l.fontSize * 0.8}px`, color: "#fff" }).setOrigin(0.5, 0);
    const manaText = this.add.text(0, l.infoPadding + 2 * (l.barraHeight + 2), "", { fontSize: `${l.fontSize * 0.8}px`, color: "#fff" }).setOrigin(0.5, 0);

    container.add([balao, nomeText, hpBar, manaBar, hpText, manaText]);

    const atualizar = () => {
      const hp = hpFn();
      const mana = manaFn();
      hpBar.clear();
      hpBar.fillStyle(0x00ff00, 1);
      hpBar.fillRect(-l.infoWidth / 2 + l.infoPadding, l.infoPadding + 16, ((l.infoWidth - 2 * l.infoPadding) * hp) / 100, l.barraHeight);
      hpText.setText(`${hp} HP`);
      manaBar.clear();
      manaBar.fillStyle(0x0000ff, 1);
      manaBar.fillRect(-l.infoWidth / 2 + l.infoPadding, l.infoPadding + 16 + l.barraHeight + 4, ((l.infoWidth - 2 * l.infoPadding) * mana) / 100, l.barraHeight);
      manaText.setText(`${mana} MP`);
      container.setPosition(sprite.x, sprite.y - sprite.displayHeight - 20);
    };

    this.events.on("update", atualizar);
    atualizar();
    return container;
  }

  atualizarBaloesInfo() {}

  // ---------------- Balão de Pergunta ----------------
  createPerguntaBalao() {
    const l = this.layout;

    // Balão
    this.balaoPergunta = this.add.graphics();
    this.balaoPergunta.fillStyle(0x222222, 0.85);
    this.balaoPergunta.fillRoundedRect(l.balaoX, l.balaoY, l.balaoWidth, l.balaoHeight, 16);

    // Container para pergunta + opções
    this.jogadorBalao = this.add.container(0, 0);

    // Texto pergunta
    this.perguntaText = this.add.text(l.balaoX + l.padding, l.balaoY + l.padding, "Carregando pergunta...", {
      fontSize: `${l.fontSize}px`,
      color: "#fff",
      wordWrap: { width: l.balaoWidth - l.padding * 2 }
    });

    this.jogadorBalao.add(this.perguntaText);
  }

  reposicionarBalao() {
    const l = this.layout;
    this.balaoPergunta.clear();
    this.balaoPergunta.fillStyle(0x222222, 0.85);
    this.balaoPergunta.fillRoundedRect(l.balaoX, l.balaoY, l.balaoWidth, l.balaoHeight, 16);
    this.perguntaText.setPosition(l.balaoX + l.padding, l.balaoY + l.padding);
    this.perguntaText.setWordWrapWidth(l.balaoWidth - l.padding * 2);
  }

  loadPergunta() {
    const perguntasShuffle = Phaser.Utils.Array.Shuffle([...this.perguntas]);
    this.perguntaAtual = perguntasShuffle[0];
    this.perguntaText.setText(this.perguntaAtual.pergunta);
    this.renderOpcoes(this.perguntaAtual.opcoes);
  }

  renderOpcoes(opcoesArray: string[]) {
    const l = this.layout;

    // Remove antigas
    this.opcoes.forEach(btn => btn.destroy());
    this.opcoes = [];

    const startY = l.balaoY + l.padding + this.perguntaText.height + 10;

    const gap = (l.balaoHeight - this.perguntaText.height - 2 * l.padding) / opcoesArray.length;

    opcoesArray.forEach((opcao, i) => {
      const y = startY + gap * i;
      const btn = this.add.text(l.balaoX + l.padding, y, `${this.LETRAS[i]}: ${opcao}`, {
        fontSize: `${l.fontSize}px`,
        color: "#fff",
        backgroundColor: "#333",
        padding: { x: 10, y: 6 },
        fixedWidth: l.balaoWidth - l.padding * 2
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.verificarResposta(opcao));

      this.opcoes.push(btn);
    });
  }

  verificarResposta(resposta: string) {
    this.opcoes.forEach(btn => btn.disableInteractive());

    if (resposta === this.perguntaAtual.resposta) {
      this.inimigoHP = Math.max(this.inimigoHP - Phaser.Math.Between(15, 25), 0);
      this.perguntaText.setText("✅ Acertou! Você atacou!");
      this.animaAtaque(this.player, this.enemy);
      this.incrementarSpecial();
    } else {
      this.jogadorHP = Math.max(this.jogadorHP - Phaser.Math.Between(10, 20), 0);
      this.perguntaText.setText("❌ Errou! O inimigo atacou!");
      this.animaAtaque(this.enemy, this.player);
    }

    if (this.jogadorHP <= 0 || this.inimigoHP <= 0) {
      this.time.delayedCall(1000, () => this.mostrarTelaFinal(this.jogadorHP <= 0 ? "derrota" : "vitoria"));
    } else {
      this.time.delayedCall(1200, () => this.loadPergunta());
    }
  }

  animaAtaque(atacante: Phaser.GameObjects.Sprite, alvo: Phaser.GameObjects.Sprite) {
    this.tweens.add({ targets: atacante, x: alvo.x - 50, y: atacante.y - 20, duration: 300, yoyo: true, ease: "Power1" });
  }

  // ---------------- Botão Voltar ----------------
  criarBotaoVoltar() {
    const l = this.layout;
    this.add.text(20, 20, "⬅ Voltar", {
      fontSize: `${l.btnFontSize}px`,
      color: "#fff",
      backgroundColor: "#333",
      padding: { x: 10, y: 6 },
    }).setInteractive({ useHandCursor: true }).on("pointerdown", () => window.history.back());
  }

  // ---------------- Balão de Ações ----------------
criarBalaoAcoes() {
  const { width, height } = this.scale;
  const l = this.layout;

  // Container principal
  this.acaoContainer = this.add.container(width * 0.2, height * 0.92);

  // Fundo do balão
  const balao = this.add.graphics();
  balao.fillStyle(0x222222, 0.85);
  balao.fillRoundedRect(-l.acaoWidth / 2, -l.acaoHeight / 2, l.acaoWidth, l.acaoHeight, 12);
  this.acaoContainer.add(balao);

  // Botões
  const textos = ["❤️ Cura HP", "💧 Cura Mana", "✨ Restaurar"];
  const numBotoes = textos.length;
  const gap = 10; // Espaço entre botões
  const btnHeight = (l.acaoHeight - (gap * (numBotoes + 1))) / numBotoes;

  textos.forEach((txt, i) => {
    const y = -l.acaoHeight / 2 + gap + i * (btnHeight + gap);
    const btn = this.add.text(0, y, txt, {
      fontSize: `${l.fontSize}px`,
      color: "#fff",
      backgroundColor: "#333",
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5, 0) // centraliza horizontalmente
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.usarAcao(txt));
    this.acaoContainer.add(btn);
  });

  // Barra de especial
  const barraContainer = this.add.container(-l.acaoWidth / 2 + l.acaoPadding, l.acaoHeight / 2 - 20);
  this.acaoContainer.add(barraContainer);

  this.specialMeter = [];
  const gomoWidth = 40;
  const gomoHeight = 12;
  const gomoGap = l.specialGap;
  for (let i = 0; i < 5; i++) {
    const gomo = this.add.graphics();
    gomo.fillStyle(0x555555, 1);
    gomo.fillRect(i * (gomoWidth + gomoGap), 0, gomoWidth, gomoHeight);
    barraContainer.add(gomo);
    this.specialMeter.push(gomo);
  }
}

reposicionarAcoes() {
  const { width, height } = this.scale;
  this.acaoContainer.setPosition(width * 0.2, height * 0.92);
}


  usarAcao(tipo: string) {
    switch (tipo) {
      case "❤️ Cura HP": this.jogadorHP = Math.min(this.jogadorHP + 20, 100); break;
      case "💧 Cura Mana": this.jogadorMana = Math.min(this.jogadorMana + 20, 100); break;
      case "✨ Restaurar": this.jogadorHP = 100; this.jogadorMana = 100; this.resetSpecial(); break;
    }
  }

  incrementarSpecial() {
    if (this.specialValue < this.specialMeter.length) {
      const gomo = this.specialMeter[this.specialValue];
      gomo.clear();
      gomo.fillStyle(0xffff00, 1);
      gomo.fillRect(0, 0, 40, 12);
      this.specialValue++;
    }
  }

  resetSpecial() {
    this.specialValue = 0;
    this.specialMeter.forEach(gomo => {
      gomo.clear();
      gomo.fillStyle(0x555555, 1);
      gomo.fillRect(0, 0, 40, 12);
    });
  }

  // ---------------- Tela Final ----------------
  mostrarTelaFinal(tipo: "vitoria" | "derrota") {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0, 0).setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 500 });

    const texto = tipo === "vitoria" ? "🎉 Você venceu!" : "💀 Você perdeu!";
    const cor = tipo === "vitoria" ? "#00ff00" : "#ff0000";
    const l = this.layout;

    const endText = this.add.text(width / 2, height / 2 - height * 0.1, texto, { fontSize: `${l.fontSize * 2}px`, color: cor }).setOrigin(0.5);

    const btnContinuar = this.add.text(width / 2, height / 2 + 20, "🔄 Continuar", { fontSize: `${l.btnFontSize}px`, color: "#fff", backgroundColor: "#333", padding: { x: 12, y: 8 } })
      .setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.jogadorHP = 100; this.jogadorMana = 100;
        this.inimigoHP = 100; this.inimigoMana = 100;
        this.resetSpecial();
        overlay.destroy(); endText.destroy(); btnContinuar.destroy(); btnSair.destroy();
        this.loadPergunta();
      });

    const btnSair = this.add.text(width / 2, height / 2 + 70, "🚪 Sair", { fontSize: `${l.btnFontSize}px`, color: "#fff", backgroundColor: "#333", padding: { x: 12, y: 8 } })
      .setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerdown", () => window.location.href = "/trilha");
  }
}
