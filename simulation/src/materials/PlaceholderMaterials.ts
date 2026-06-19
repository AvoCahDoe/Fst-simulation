import { Color3, Scene, StandardMaterial } from "babylonjs";

export interface BuildingMaterials {
  wall: StandardMaterial;
  floor: StandardMaterial;
  ceiling: StandardMaterial;
  door: StandardMaterial;
  exterior: StandardMaterial;
  accent: StandardMaterial;
}

export function createPlaceholderMaterials(scene: Scene): BuildingMaterials {
  const wall = new StandardMaterial("wallMat", scene);
  wall.diffuseColor = new Color3(0.91, 0.88, 0.84);
  wall.specularColor = new Color3(0.1, 0.1, 0.1);

  const floor = new StandardMaterial("floorMat", scene);
  floor.diffuseColor = new Color3(0.62, 0.62, 0.62);
  floor.specularColor = new Color3(0.05, 0.05, 0.05);

  const ceiling = new StandardMaterial("ceilingMat", scene);
  ceiling.diffuseColor = new Color3(0.96, 0.96, 0.96);
  ceiling.specularColor = new Color3(0.05, 0.05, 0.05);

  const door = new StandardMaterial("doorMat", scene);
  door.diffuseColor = new Color3(0.55, 0.41, 0.08);
  door.specularColor = new Color3(0.1, 0.1, 0.1);

  const exterior = new StandardMaterial("exteriorMat", scene);
  exterior.diffuseColor = new Color3(0.75, 0.73, 0.7);
  exterior.specularColor = new Color3(0.1, 0.1, 0.1);

  const accent = new StandardMaterial("accentMat", scene);
  accent.diffuseColor = new Color3(0.12, 0.35, 0.55);
  accent.specularColor = new Color3(0.15, 0.15, 0.15);

  return { wall, floor, ceiling, door, exterior, accent };
}
