export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",          // div que receberá o canvas
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.RESIZE,       // canvas ajusta ao tamanho da tela
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: { default: "arcade", arcade: { debug: false } },
};
