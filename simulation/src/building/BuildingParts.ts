import {
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "babylonjs";
import { BuildingMaterials } from "@/materials/PlaceholderMaterials";

const WALL_THICKNESS = 0.2;

export interface RoomOptions {
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  floorY: number;
  height: number;
  materials: BuildingMaterials;
  scene: Scene;
  doorNorth?: number;
  doorSouth?: number;
  doorEast?: number;
  doorWest?: number;
  withCeiling?: boolean;
}

function enableCollision(mesh: Mesh): void {
  mesh.checkCollisions = true;
}

export function createFloor(
  scene: Scene,
  name: string,
  x: number,
  z: number,
  width: number,
  depth: number,
  floorY: number,
  material: StandardMaterial
): Mesh {
  const floor = MeshBuilder.CreateBox(
    name,
    { width, height: 0.15, depth },
    scene
  );
  floor.position = new Vector3(x, floorY - 0.075, z);
  floor.material = material;
  enableCollision(floor);
  return floor;
}

export function createCeiling(
  scene: Scene,
  name: string,
  x: number,
  z: number,
  width: number,
  depth: number,
  floorY: number,
  height: number,
  material: StandardMaterial
): Mesh {
  const ceiling = MeshBuilder.CreateBox(
    name,
    { width, height: 0.1, depth },
    scene
  );
  ceiling.position = new Vector3(x, floorY + height, z);
  ceiling.material = material;
  enableCollision(ceiling);
  return ceiling;
}

export function createWall(
  scene: Scene,
  name: string,
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  depth: number,
  material: StandardMaterial
): Mesh {
  const wall = MeshBuilder.CreateBox(
    name,
    { width, height, depth },
    scene
  );
  wall.position = new Vector3(x, y + height / 2, z);
  wall.material = material;
  enableCollision(wall);
  return wall;
}

function createWallWithDoor(
  scene: Scene,
  name: string,
  axis: "x" | "z",
  centerX: number,
  centerZ: number,
  length: number,
  floorY: number,
  height: number,
  doorWidth: number,
  material: StandardMaterial,
  fixedCoord: number
): void {
  const segment = (length - doorWidth) / 2;
  if (segment <= 0) return;

  if (axis === "x") {
    const leftCenter = centerX - doorWidth / 2 - segment / 2;
    const rightCenter = centerX + doorWidth / 2 + segment / 2;
    createWall(
      scene,
      `${name}_left`,
      leftCenter,
      floorY,
      fixedCoord,
      segment,
      height,
      WALL_THICKNESS,
      material
    );
    createWall(
      scene,
      `${name}_right`,
      rightCenter,
      floorY,
      fixedCoord,
      segment,
      height,
      WALL_THICKNESS,
      material
    );
  } else {
    const backCenter = centerZ - doorWidth / 2 - segment / 2;
    const frontCenter = centerZ + doorWidth / 2 + segment / 2;
    createWall(
      scene,
      `${name}_back`,
      fixedCoord,
      floorY,
      backCenter,
      WALL_THICKNESS,
      height,
      segment,
      material
    );
    createWall(
      scene,
      `${name}_front`,
      fixedCoord,
      floorY,
      frontCenter,
      WALL_THICKNESS,
      height,
      segment,
      material
    );
  }
}

export function createRoom(options: RoomOptions): Mesh[] {
  const {
    name,
    x,
    z,
    width,
    depth,
    floorY,
    height,
    materials,
    scene,
    doorNorth = 0,
    doorSouth = 0,
    doorEast = 0,
    doorWest = 0,
    withCeiling = true,
  } = options;

  const meshes: Mesh[] = [];
  const halfW = width / 2;
  const halfD = depth / 2;

  meshes.push(
    createFloor(scene, `${name}_floor`, x, z, width, depth, floorY, materials.floor)
  );

  if (withCeiling) {
    meshes.push(
      createCeiling(
        scene,
        `${name}_ceiling`,
        x,
        z,
        width,
        depth,
        floorY,
        height,
        materials.ceiling
      )
    );
  }

  // North wall (-Z)
  if (doorNorth > 0) {
    createWallWithDoor(
      scene,
      `${name}_wall_n`,
      "x",
      x,
      z - halfD,
      width,
      floorY,
      height,
      doorNorth,
      materials.wall,
      z - halfD
    );
  } else {
    meshes.push(
      createWall(
        scene,
        `${name}_wall_n`,
        x,
        floorY,
        z - halfD,
        width,
        height,
        WALL_THICKNESS,
        materials.wall
      )
    );
  }

  // South wall (+Z)
  if (doorSouth > 0) {
    createWallWithDoor(
      scene,
      `${name}_wall_s`,
      "x",
      x,
      z + halfD,
      width,
      floorY,
      height,
      doorSouth,
      materials.wall,
      z + halfD
    );
  } else {
    meshes.push(
      createWall(
        scene,
        `${name}_wall_s`,
        x,
        floorY,
        z + halfD,
        width,
        height,
        WALL_THICKNESS,
        materials.wall
      )
    );
  }

  // West wall (-X)
  if (doorWest > 0) {
    createWallWithDoor(
      scene,
      `${name}_wall_w`,
      "z",
      x - halfW,
      z,
      depth,
      floorY,
      height,
      doorWest,
      materials.wall,
      x - halfW
    );
  } else {
    meshes.push(
      createWall(
        scene,
        `${name}_wall_w`,
        x - halfW,
        floorY,
        z,
        WALL_THICKNESS,
        height,
        depth,
        materials.wall
      )
    );
  }

  // East wall (+X)
  if (doorEast > 0) {
    createWallWithDoor(
      scene,
      `${name}_wall_e`,
      "z",
      x + halfW,
      z,
      depth,
      floorY,
      height,
      doorEast,
      materials.wall,
      x + halfW
    );
  } else {
    meshes.push(
      createWall(
        scene,
        `${name}_wall_e`,
        x + halfW,
        floorY,
        z,
        WALL_THICKNESS,
        height,
        depth,
        materials.wall
      )
    );
  }

  return meshes;
}

export function createDoorway(
  scene: Scene,
  name: string,
  x: number,
  z: number,
  floorY: number,
  height: number,
  width: number,
  material: StandardMaterial
): Mesh {
  const door = MeshBuilder.CreateBox(
    name,
    { width, height: height * 0.9, depth: 0.08 },
    scene
  );
  door.position = new Vector3(x, floorY + (height * 0.9) / 2, z);
  door.material = material;
  return door;
}

export function createStairs(
  scene: Scene,
  name: string,
  startX: number,
  startZ: number,
  floorY: number,
  rise: number,
  run: number,
  width: number,
  steps: number,
  direction: "north" | "south",
  material: StandardMaterial
): Mesh[] {
  const meshes: Mesh[] = [];
  const stepRise = rise / steps;
  const stepRun = run / steps;
  const dir = direction === "north" ? -1 : 1;

  for (let i = 0; i < steps; i++) {
    const step = MeshBuilder.CreateBox(
      `${name}_step_${i}`,
      { width, height: stepRise, depth: stepRun },
      scene
    );
    const z = startZ + dir * (i * stepRun + stepRun / 2);
    step.position = new Vector3(
      startX,
      floorY + i * stepRise + stepRise / 2,
      z
    );
    step.material = material;
    enableCollision(step);
    meshes.push(step);
  }

  return meshes;
}

export function createExteriorPad(
  scene: Scene,
  x: number,
  z: number,
  width: number,
  depth: number,
  material: StandardMaterial
): Mesh {
  const pad = MeshBuilder.CreateGround(
    "exterior_pad",
    { width, height: depth },
    scene
  );
  pad.position = new Vector3(x, 0, z);
  pad.material = material;
  enableCollision(pad);
  return pad;
}

export function createExteriorWall(
  scene: Scene,
  name: string,
  x: number,
  z: number,
  width: number,
  depth: number,
  height: number,
  material: StandardMaterial
): Mesh {
  const shell = MeshBuilder.CreateBox(
    name,
    { width, height, depth },
    scene
  );
  shell.position = new Vector3(x, height / 2, z);
  shell.material = material;
  enableCollision(shell);
  return shell;
}
