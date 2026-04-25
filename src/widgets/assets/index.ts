import { Texture } from "pixi.js";

import AgentSpriteData from "./MockAgentSprite.png";
import BackgroundTileData from "./MockBackgroundTile.png";
import FoodSourceSpriteData from "./MockFoodSourceSprite.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTexture(data: any): Texture {
  const image = new Image();
  image.src = data;

  return Texture.from(image);
}

export const Textures = {
  agent: toTexture(AgentSpriteData),
  backgroundTile: toTexture(BackgroundTileData),
  foodSource: toTexture(FoodSourceSpriteData),
};
