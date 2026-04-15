import { Assets } from "pixi.js";

import AgentSpriteURL from "./assets/MockAgentSprite.png";
import BackgroundTileURL from "./assets/MockBackgroundTile.png";

const agentTexture = await Assets.load({
  src: AgentSpriteURL,
  format: "png",
});

const backgroundTileTexture = await Assets.load({
  src: BackgroundTileURL,
  format: "png",
});

export const Textures = {
  agent: agentTexture,
  backgroundTile: backgroundTileTexture,
};
