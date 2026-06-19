import { Color3, DynamicTexture, Scene, StandardMaterial } from "babylonjs";

export interface BuildingMaterials {
  wall: StandardMaterial;
  floor: StandardMaterial;
  ceiling: StandardMaterial;
  door: StandardMaterial;
  exterior: StandardMaterial;
  accent: StandardMaterial;
}

function createBrickWallTexture(scene: Scene): DynamicTexture {
  const size = 256;
  const tex = new DynamicTexture("wallBrickTex", size, scene, true);
  const ctx = tex.getContext() as CanvasRenderingContext2D;

  const mortar = "#c8c0b4";
  const brickA = "#b8a898";
  const brickB = "#a89888";

  ctx.fillStyle = mortar;
  ctx.fillRect(0, 0, size, size);

  const brickW = 64;
  const brickH = 28;
  const gap = 3;

  for (let row = 0; row < size / brickH + 1; row++) {
    const offset = row % 2 === 0 ? 0 : brickW / 2;
    for (let col = -1; col < size / brickW + 1; col++) {
      const x = col * brickW + offset;
      const y = row * brickH;
      ctx.fillStyle = (row + col) % 2 === 0 ? brickA : brickB;
      ctx.fillRect(x + gap / 2, y + gap / 2, brickW - gap, brickH - gap);
    }
  }

  tex.update();
  tex.uScale = 4;
  tex.vScale = 2;
  return tex;
}

function createConcreteTexture(
  scene: Scene,
  name: string,
  base: string,
  variation: string
): DynamicTexture {
  const size = 128;
  const tex = new DynamicTexture(name, size, scene, true);
  const ctx = tex.getContext() as CanvasRenderingContext2D;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = 2 + Math.random() * 6;
    const h = 2 + Math.random() * 6;
    ctx.fillStyle = variation;
    ctx.globalAlpha = 0.15 + Math.random() * 0.2;
    ctx.fillRect(x, y, w, h);
  }
  ctx.globalAlpha = 1;
  tex.update();
  tex.uScale = 6;
  tex.vScale = 6;
  return tex;
}

export function createPlaceholderMaterials(scene: Scene): BuildingMaterials {
  const wall = new StandardMaterial("wallMat", scene);
  wall.diffuseTexture = createBrickWallTexture(scene);
  wall.specularColor = new Color3(0.08, 0.08, 0.08);

  const floor = new StandardMaterial("floorMat", scene);
  floor.diffuseTexture = createConcreteTexture(
    scene,
    "floorTex",
    "#8a8a8a",
    "#6e6e6e"
  );
  floor.specularColor = new Color3(0.05, 0.05, 0.05);

  const ceiling = new StandardMaterial("ceilingMat", scene);
  ceiling.diffuseColor = new Color3(0.96, 0.96, 0.96);
  ceiling.specularColor = new Color3(0.05, 0.05, 0.05);

  const door = new StandardMaterial("doorMat", scene);
  door.diffuseColor = new Color3(0.55, 0.41, 0.08);
  door.specularColor = new Color3(0.1, 0.1, 0.1);

  const exterior = new StandardMaterial("exteriorMat", scene);
  exterior.diffuseTexture = createConcreteTexture(
    scene,
    "exteriorTex",
    "#b8b4ae",
    "#9a9690"
  );
  exterior.specularColor = new Color3(0.1, 0.1, 0.1);

  const accent = new StandardMaterial("accentMat", scene);
  accent.diffuseColor = new Color3(0.12, 0.35, 0.55);
  accent.specularColor = new Color3(0.15, 0.15, 0.15);

  return { wall, floor, ceiling, door, exterior, accent };
}
