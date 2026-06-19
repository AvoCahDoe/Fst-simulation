import { Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";
import {
  createCeiling,
  createDoorway,
  createExteriorPad,
  createFloor,
  createRoom,
  createStairs,
  createWall,
} from "@/building/BuildingParts";
import {
  BuildingMaterials,
  createPlaceholderMaterials,
} from "@/materials/PlaceholderMaterials";

const FLOOR_HEIGHT = 3;
const DOOR_WIDTH = 2.2;

export interface FacultyBuildingResult {
  meshes: Mesh[];
  spawnPosition: Vector3;
  materials: BuildingMaterials;
}

export class FacultyBuilding {
  private meshes: Mesh[] = [];
  readonly spawnPosition: Vector3;
  readonly materials: BuildingMaterials;

  constructor(private scene: Scene) {
    this.materials = createPlaceholderMaterials(scene);
    this.buildExterior();
    this.buildGroundFloor();
    this.buildUpperFloor();
    this.buildStaircases();
    // Atrium center, ground floor (feet position)
    this.spawnPosition = new Vector3(0, 0, 0);
  }

  getMeshes(): Mesh[] {
    return this.meshes;
  }

  private track(mesh: Mesh | Mesh[]): void {
    if (Array.isArray(mesh)) {
      this.meshes.push(...mesh);
    } else {
      this.meshes.push(mesh);
    }
  }

  private buildExterior(): void {
    this.track(
      createExteriorPad(this.scene, 0, 0, 90, 80, this.materials.exterior)
    );

    const facade = MeshBuilder.CreateBox(
      "facade_sign",
      { width: 20, height: 1.2, depth: 0.3 },
      this.scene
    );
    facade.position = new Vector3(0, 2.5, 24.5);
    facade.material = this.materials.accent;
    this.track(facade);
  }

  private buildGroundFloor(): void {
    const y = 0;
    const h = FLOOR_HEIGHT;

    // Central atrium (double-height, no ceiling)
    this.track(
      createRoom({
        name: "atrium_gf",
        x: 0,
        z: 0,
        width: 16,
        depth: 12,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorSouth: 4,
        doorWest: DOOR_WIDTH,
        doorEast: DOOR_WIDTH,
        doorNorth: DOOR_WIDTH,
        withCeiling: false,
      })
    );

    // Amphitheater (west wing)
    this.track(
      createRoom({
        name: "amphitheater",
        x: -20,
        z: 0,
        width: 18,
        depth: 14,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorEast: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    // Admin offices (east wing)
    this.track(
      createRoom({
        name: "admin_hall",
        x: 20,
        z: 0,
        width: 16,
        depth: 14,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorWest: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    this.track(
      createRoom({
        name: "admin_office_1",
        x: 28,
        z: -5,
        width: 8,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorWest: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    this.track(
      createRoom({
        name: "admin_office_2",
        x: 28,
        z: 5,
        width: 8,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorWest: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    // Entry hall (south)
    this.track(
      createRoom({
        name: "entry_hall",
        x: 0,
        z: 14,
        width: 12,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorNorth: 4,
        doorSouth: 4,
        withCeiling: true,
      })
    );

    this.track(
      createDoorway(
        this.scene,
        "main_entrance",
        0,
        18.2,
        y,
        h,
        4,
        this.materials.door
      )
    );

    // North labs corridor
    this.track(
      createRoom({
        name: "lab_corridor_gf",
        x: 0,
        z: -12,
        width: 40,
        depth: 4,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorSouth: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    this.track(
      createRoom({
        name: "lab_physics",
        x: -14,
        z: -18,
        width: 10,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorSouth: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    this.track(
      createRoom({
        name: "lab_chemistry",
        x: 0,
        z: -18,
        width: 10,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorSouth: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    this.track(
      createRoom({
        name: "lab_computer",
        x: 14,
        z: -18,
        width: 10,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorSouth: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    // Outer shell walls (visual perimeter)
    this.buildPerimeterWalls(y, h);
  }

  private buildUpperFloor(): void {
    const y = FLOOR_HEIGHT;
    const h = FLOOR_HEIGHT;

    // West classrooms
    this.track(
      createRoom({
        name: "classroom_1",
        x: -24,
        z: -6,
        width: 10,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorEast: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    this.track(
      createRoom({
        name: "classroom_2",
        x: -24,
        z: 4,
        width: 10,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorEast: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    this.track(
      createRoom({
        name: "classroom_3",
        x: -24,
        z: 14,
        width: 10,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorEast: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    // Upper corridor (west side)
    this.track(
      createRoom({
        name: "upper_corridor_w",
        x: -14,
        z: 4,
        width: 4,
        depth: 28,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorWest: DOOR_WIDTH,
        doorEast: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    // East upper labs
    this.track(
      createRoom({
        name: "lab_research_1",
        x: 20,
        z: -8,
        width: 12,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorWest: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    this.track(
      createRoom({
        name: "lab_research_2",
        x: 20,
        z: 6,
        width: 12,
        depth: 8,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorWest: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    // East upper corridor
    this.track(
      createRoom({
        name: "upper_corridor_e",
        x: 12,
        z: 0,
        width: 4,
        depth: 24,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorWest: DOOR_WIDTH,
        doorEast: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    // North upper corridor
    this.track(
      createRoom({
        name: "upper_corridor_n",
        x: 0,
        z: -12,
        width: 36,
        depth: 4,
        floorY: y,
        height: h,
        materials: this.materials,
        scene: this.scene,
        doorSouth: DOOR_WIDTH,
        withCeiling: true,
      })
    );

    // Atrium balcony rails (floor segments around open atrium)
    this.track(
      createFloor(
        this.scene,
        "balcony_s",
        0,
        8,
        16,
        4,
        y,
        this.materials.floor
      )
    );

    this.track(
      createFloor(
        this.scene,
        "balcony_n",
        0,
        -8,
        16,
        4,
        y,
        this.materials.floor
      )
    );

    // Atrium upper railing walls (low, open center)
    this.track(
      createWall(
        this.scene,
        "balcony_rail_w",
        -8,
        y,
        0,
        0.15,
        1.1,
        12,
        this.materials.accent
      )
    );

    this.track(
      createWall(
        this.scene,
        "balcony_rail_e",
        8,
        y,
        0,
        0.15,
        1.1,
        12,
        this.materials.accent
      )
    );

    this.track(
      createCeiling(
        this.scene,
        "building_roof",
        0,
        0,
        62,
        46,
        y,
        h,
        this.materials.ceiling
      )
    );
  }

  private buildStaircases(): void {
    this.track(
      createStairs(
        this.scene,
        "stairs_west",
        -10,
        10,
        0,
        FLOOR_HEIGHT,
        4,
        3,
        8,
        "north",
        this.materials.floor
      )
    );

    this.track(
      createStairs(
        this.scene,
        "stairs_east",
        10,
        10,
        0,
        FLOOR_HEIGHT,
        4,
        3,
        8,
        "north",
        this.materials.floor
      )
    );
  }

  private buildPerimeterWalls(floorY: number, height: number): void {
    const wallH = height * 2;
    const t = 0.3;

    this.track(
      createWall(
        this.scene,
        "perimeter_n",
        0,
        floorY,
        -23,
        62,
        wallH,
        t,
        this.materials.exterior
      )
    );

    this.track(
      createWall(
        this.scene,
        "perimeter_s",
        0,
        floorY,
        23,
        62,
        wallH,
        t,
        this.materials.exterior
      )
    );

    this.track(
      createWall(
        this.scene,
        "perimeter_w",
        -31,
        floorY,
        0,
        t,
        wallH,
        46,
        this.materials.exterior
      )
    );

    this.track(
      createWall(
        this.scene,
        "perimeter_e",
        31,
        floorY,
        0,
        t,
        wallH,
        46,
        this.materials.exterior
      )
    );
  }
}
