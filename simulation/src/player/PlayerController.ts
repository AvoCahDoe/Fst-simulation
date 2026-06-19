import {
  Observer,
  Ray,
  Scene,
  UniversalCamera,
  Vector3,
} from "babylonjs";
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
  private inputActive = false;
  private controlsAttached = false;
  private jumpVelocity = 0;
  private airborne = false;
  private readonly onPointerLockChange: () => void;
  private readonly onCanvasClick: () => void;
  private readonly onKeyDown: (event: KeyboardEvent) => void;
  private readonly beforeRenderObserver: Observer<Scene>;

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
      if (!this.inputActive) return;
      this.requestPointerLock();
    };

    this.onKeyDown = (event: KeyboardEvent) => {
      if (!this.inputActive || this.settings.flying) return;
      if (event.code !== this.settings.keys.flyUp) return;
      if (!this.isGrounded() || this.airborne) return;
      this.jumpVelocity = this.settings.jumpForce;
      this.airborne = true;
    };

    this.beforeRenderObserver = scene.onBeforeRenderObservable.add(() => {
      this.updateJump(scene.getEngine().getDeltaTime() / 1000);
    });

    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    this.canvas.addEventListener("click", this.onCanvasClick);
    window.addEventListener("keydown", this.onKeyDown);

    this.applySettings(settings);
    this.setInputActive(false);
  }

  isPointerLocked(): boolean {
    return this.pointerLocked;
  }

  setInputActive(active: boolean): void {
    this.inputActive = active;

    if (!active) {
      this.releasePointerLock();
      this.jumpVelocity = 0;
      this.airborne = false;
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
    if (!this.inputActive) return;
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
      this.jumpVelocity = 0;
      this.airborne = false;
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

  private isGrounded(): boolean {
    const origin = this.camera.position.clone();
    const ray = new Ray(origin, Vector3.Down(), 1.05);
    const pick = this.scene.pickWithRay(ray, (mesh) => mesh.checkCollisions);
    return pick?.hit === true;
  }

  private updateJump(deltaTime: number): void {
    if (this.settings.flying || !this.inputActive) {
      this.jumpVelocity = 0;
      this.airborne = false;
      return;
    }

    if (!this.airborne) return;

    this.camera.applyGravity = false;
    this.camera.position.y += this.jumpVelocity * deltaTime;
    this.jumpVelocity += this.scene.gravity.y * deltaTime * 3;

    if (this.isGrounded() && this.jumpVelocity <= 0) {
      this.jumpVelocity = 0;
      this.airborne = false;
      this.camera.applyGravity = true;
    }
  }

  dispose(): void {
    this.scene.onBeforeRenderObservable.remove(this.beforeRenderObserver);
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
    this.canvas.removeEventListener("click", this.onCanvasClick);
    window.removeEventListener("keydown", this.onKeyDown);
    this.releasePointerLock();
    if (this.controlsAttached) {
      this.camera.detachControl();
    }
    this.camera.dispose();
  }
}
