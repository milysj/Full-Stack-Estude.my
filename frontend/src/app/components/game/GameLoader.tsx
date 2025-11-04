"use client";

import { useEffect, useRef } from "react";

export default function GameLoader() {
  const gameRef = useRef<any>(null);

  useEffect(() => {
    const loadPhaser = async () => {
      const Phaser = await import("phaser");
      const { default: MainScene } = await import("@/app/game/scenes/MainScene");
      const { config } = await import("@/app/game/config");

      if (!gameRef.current) {
        gameRef.current = new Phaser.Game({ ...config, scene: MainScene });
      }
    };

    loadPhaser();

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      id="game-container"
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
}



