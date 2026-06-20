import { Texture } from "pixi.js";

import AgentBodySprite from "./MockAgentBodySprite.png";
import AgentEyesSprite from "./MockAgentBodySprite.png";
import BackgroundTileData from "./MockBackgroundTile.png";
import FoodSourceSpriteData from "./MockFoodSourceSprite.png";

export { AgentBodySprite, AgentEyesSprite, FoodSourceSpriteData };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTexture(data: any): Texture {
  const image = new Image();
  image.src = data;

  return Texture.from(image);
}

export const Textures = {
  backgroundTile: toTexture(BackgroundTileData),
  foodSource: toTexture(FoodSourceSpriteData),
  agent: {
    body: toTexture(AgentBodySprite),
    eyes: toTexture(AgentEyesSprite),
  },
};
