import { Scene, UniversalCamera, Vector3 } from "babylonjs";
import {
  keyCodeFromSetting,
  PlayerSettings,
} from "@/settings/playerSettings";

export class PlayerController {
  readonly camera: UniversalCamera;
  private readonly canvas: HTMLCanvasElement;
  private readonly scene: Scene;
  private settings: PlayerSettings;
  private pointerLocked = false;
  private pointerLockAllowed = true;
  private controlsAttached = true;
  private readonly onPointerLockChange: () => void;
  private readonly onCanvasClick: () => void;

  constructor(
    scene: Scene,
    canvas: HTMLCanvasElement,
    spawnPosition: Vector3,
    settings: PlayerSettings
  ) {
    this.scene = scene;
    this.canvas = canvas;
    this.settings = settings;

    scene.collisionsEnabled = true;
    scene.gravity = new Vector3(0, -0.4, 0);

    this.camera = new UniversalCamera(
      "player",
      spawnPosition.clone(),
      scene
    );

    this.camera.ellipsoid = new Vector3(0.35, 0.9, 0.35);
    this.camera.ellipsoidOffset = new Vector3(0, 0.9, 0);
    this.camera.inertia = 0.5;
    this.camera.minZ = 0.1;

    this.camera.setTarget(spawnPosition.add(new Vector3(0, 0, -1)));
    this.camera.attachControl(true);

    const mouseInput = this.camera.inputs.attached.mouse as {
      touchEnabled?: boolean;
      angularSensibility?: number;
    } | undefined;
    if (mouseInput) {
      mouseInput.touchEnabled = false;
    }

    this.onPointerLockChange = () => {
      this.pointerLocked =
        document.pointerLockElement === this.canvas;
    };

    this.onCanvasClick = () => {
      if (!this.pointerLockAllowed) return;
      this.requestPointerLock();
    };

    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    this.canvas.addEventListener("click", this.onCanvasClick);

    this.applySettings(settings);
  }

  isPointerLocked(): boolean {
    return this.pointerLocked;
  }

  setSettingsActive(active: boolean): void {
    this.pointerLockAllowed = !active;

    if (active) {
      this.releasePointerLock();
      if (this.controlsAttached) {
        this.camera.detachControl();
        this.controlsAttached = false;
      }
      return;
    }

    if (!this.controlsAttached) {
      this.camera.attachControl(true);
      this.controlsAttached = true;
    }
  }

  requestPointerLock(): void {
    if (!this.pointerLockAllowed) return;
    if (document.pointerLockElement === this.canvas) return;

    void Promise.resolve(this.canvas.requestPointerLock()).catch(() => {
      // Browser blocks immediate re-lock after exit; ignore.
    });
  }

  releasePointerLock(): void {
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  }

  applySettings(settings: PlayerSettings): void {
    this.settings = settings;

    this.camera.speed = settings.speed;
    this.camera.fov = (settings.fov * Math.PI) / 180;
    this.camera.angularSensibility = 2000 / settings.sensitivity;

    const mouseInput = this.camera.inputs.attached.mouse as {
      angularSensibility?: number;
    } | undefined;
    if (mouseInput) {
      mouseInput.angularSensibility = 2000 / settings.sensitivity;
    }

    this.camera.keysUp = [keyCodeFromSetting(settings.keys.forward)];
    this.camera.keysDown = [keyCodeFromSetting(settings.keys.backward)];
    this.camera.keysLeft = [keyCodeFromSetting(settings.keys.left)];
    this.camera.keysRight = [keyCodeFromSetting(settings.keys.right)];

    if (settings.flying) {
      this.camera.applyGravity = false;
      this.camera.checkCollisions = false;
      this.camera.keysUpward = [keyCodeFromSetting(settings.keys.flyUp)];
      this.camera.keysDownward = [keyCodeFromSetting(settings.keys.flyDown)];
      this.scene.gravity = Vector3.Zero();
      this.scene.collisionsEnabled = false;
    } else {
      this.camera.applyGravity = true;
      this.camera.checkCollisions = true;
      this.camera.keysUpward = [];
      this.camera.keysDownward = [];
      this.scene.gravity = new Vector3(0, -0.4, 0);
      this.scene.collisionsEnabled = true;
    }
  }

  dispose(): void {
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
    this.canvas.removeEventListener("click", this.onCanvasClick);
    this.releasePointerLock();
    if (this.controlsAttached) {
      this.camera.detachControl();
    }
    this.camera.dispose();
  }
}
