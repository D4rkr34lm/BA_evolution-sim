import { Texture } from "pixi.js";

import AgentSpriteURL from "./assets/MockAgentSprite.png";
import BackgroundTileURL from "./assets/MockBackgroundTile.png";

export const Textures = {
  agent: Texture.from(AgentSpriteURL),
  backgroundTile: Texture.from(BackgroundTileURL),
};
