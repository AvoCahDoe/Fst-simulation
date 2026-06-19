import {
  Scene,
  UniversalCamera,
  Vector3,
} from "babylonjs";

export class PlayerController {
  readonly camera: UniversalCamera;

  constructor(
    scene: Scene,
    canvas: HTMLCanvasElement,
    spawnPosition: Vector3
  ) {
    scene.collisionsEnabled = true;
    scene.gravity = new Vector3(0, -0.4, 0);

    this.camera = new UniversalCamera(
      "player",
      spawnPosition.clone(),
      scene
    );

    this.camera.applyGravity = true;
    this.camera.checkCollisions = true;
    this.camera.ellipsoid = new Vector3(0.35, 0.9, 0.35);
    this.camera.ellipsoidOffset = new Vector3(0, 0.9, 0);
    this.camera.speed = 0.12;
    this.camera.angularSensibility = 2000;
    this.camera.inertia = 0.5;
    this.camera.minZ = 0.1;

    this.camera.setTarget(spawnPosition.add(new Vector3(0, 0, -1)));
    this.camera.attachControl(canvas, true);
  }

  dispose(): void {
    this.camera.detachControl();
    this.camera.dispose();
  }
}
