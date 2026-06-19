import {
  Color3,
  Mesh,
  MeshBuilder,
  Observer,
  Ray,
  Scene,
  StandardMaterial,
  UniversalCamera,
  Vector3,
} from "babylonjs";
import {
  PlayerSettings,
} from "@/settings/playerSettings";

const EYE_HEIGHT = 1.6;
const THIRD_CAM_HEIGHT = 1.8;
const THIRD_TARGET_HEIGHT = 1.2;

export class PlayerController {
  readonly camera: UniversalCamera;
  private readonly canvas: HTMLCanvasElement;
  private readonly scene: Scene;
  private readonly collider: Mesh;
  private readonly avatar: Mesh;
  private settings: PlayerSettings;
  private pointerLocked = false;
  private inputActive = false;
  private controlsAttached = false;
  private jumpVelocity = 0;
  private airborne = false;
  private readonly keysPressed = new Set<string>();
  private readonly onPointerLockChange: () => void;
  private readonly onCanvasClick: () => void;
  private readonly onKeyDown: (event: KeyboardEvent) => void;
  private readonly onKeyUp: (event: KeyboardEvent) => void;
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

    this.collider = MeshBuilder.CreateBox(
      "playerCollider",
      { width: 0.6, height: 1.8, depth: 0.6 },
      scene
    );
    this.collider.isVisible = false;
    this.collider.position = spawnPosition.clone();
    this.collider.position.y -= 0.9;
    this.collider.checkCollisions = true;
    this.collider.ellipsoid = new Vector3(0.35, 0.9, 0.35);

    this.avatar = MeshBuilder.CreateCapsule(
      "avatar",
      { height: 1.7, radius: 0.32 },
      scene
    );
    const avatarMat = new StandardMaterial("avatarMat", scene);
    avatarMat.diffuseColor = new Color3(0.35, 0.52, 0.78);
    avatarMat.specularColor = new Color3(0.1, 0.1, 0.1);
    this.avatar.material = avatarMat;
    this.avatar.isVisible = false;
    this.avatar.position.copyFrom(this.collider.position);
    this.avatar.position.y += 0.9;

    this.camera = new UniversalCamera(
      "player",
      this.getEyePosition(),
      scene
    );

    this.camera.minZ = 0.1;
    this.camera.inertia = 0.5;
    this.camera.setTarget(this.collider.position.add(new Vector3(0, 1.2, 0)));

    const mouseInput = this.camera.inputs.attached.mouse as {
      touchEnabled?: boolean;
      angularSensibility?: number;
    } | undefined;
    if (mouseInput) {
      mouseInput.touchEnabled = false;
    }

    if (this.camera.inputs.attached.keyboard) {
      this.camera.inputs.remove(this.camera.inputs.attached.keyboard);
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
      this.keysPressed.add(event.code);

      if (!this.inputActive || this.settings.flying) return;
      if (event.code !== this.settings.keys.flyUp) return;
      if (!this.isGrounded() || this.airborne) return;
      this.jumpVelocity = this.settings.jumpForce;
      this.airborne = true;
    };

    this.onKeyUp = (event: KeyboardEvent) => {
      this.keysPressed.delete(event.code);
    };

    this.beforeRenderObserver = scene.onBeforeRenderObservable.add(() => {
      const dt = scene.getEngine().getDeltaTime() / 1000;
      this.updateMovement(dt);
      this.updateJump(dt);
      this.updateCameraFromCollider();
    });

    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    this.canvas.addEventListener("click", this.onCanvasClick);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

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
      this.keysPressed.clear();
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

    if (settings.flying) {
      this.jumpVelocity = 0;
      this.airborne = false;
      this.scene.gravity = Vector3.Zero();
      this.scene.collisionsEnabled = false;
      this.collider.checkCollisions = false;
    } else {
      this.scene.gravity = new Vector3(0, -0.4, 0);
      this.scene.collisionsEnabled = true;
      this.collider.checkCollisions = true;
    }

    this.updateCameraFromCollider();
  }

  private isBindPressed(code: string): boolean {
    return this.keysPressed.has(code);
  }

  private getMoveDirection(): Vector3 {
    const yaw = this.camera.rotation.y;
    const forward = new Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = Vector3.Cross(Vector3.Up(), forward).normalize();
    const move = Vector3.Zero();

    if (this.isBindPressed(this.settings.keys.forward)) move.addInPlace(forward);
    if (this.isBindPressed(this.settings.keys.backward)) move.subtractInPlace(forward);
    if (this.isBindPressed(this.settings.keys.left)) move.subtractInPlace(right);
    if (this.isBindPressed(this.settings.keys.right)) move.addInPlace(right);

    if (this.settings.flying) {
      if (this.isBindPressed(this.settings.keys.flyUp)) move.y += 1;
      if (this.isBindPressed(this.settings.keys.flyDown)) move.y -= 1;
    }

    return move;
  }

  private updateMovement(deltaTime: number): void {
    if (!this.inputActive) return;

    const move = this.getMoveDirection();
    if (move.lengthSquared() < 0.001) return;

    move.normalize().scale(this.settings.speed * deltaTime * 60);

    if (this.settings.flying) {
      this.collider.position.addInPlace(move);
    } else {
      this.collider.moveWithCollisions(move);
    }

    this.avatar.position.copyFrom(this.collider.position);
    this.avatar.position.y += 0.9;
  }

  private getEyePosition(): Vector3 {
    return this.collider.position.add(new Vector3(0, EYE_HEIGHT, 0));
  }

  private updateCameraFromCollider(): void {
    const feet = this.collider.position;

    if (this.settings.cameraMode === "first") {
      this.avatar.isVisible = false;
      this.camera.position.copyFrom(feet);
      this.camera.position.y += EYE_HEIGHT;
      return;
    }

    this.avatar.isVisible = true;
    this.avatar.position.copyFrom(feet);
    this.avatar.position.y += 0.9;

    const yaw = this.camera.rotation.y;
    const dist = this.settings.thirdPersonDistance;
    const camX = feet.x + Math.sin(yaw) * dist;
    const camZ = feet.z + Math.cos(yaw) * dist;

    this.camera.position.set(camX, feet.y + THIRD_CAM_HEIGHT, camZ);
    this.camera.setTarget(
      new Vector3(feet.x, feet.y + THIRD_TARGET_HEIGHT, feet.z)
    );
  }

  private isGrounded(): boolean {
    const origin = this.collider.position.clone();
    origin.y += 0.1;
    const ray = new Ray(origin, Vector3.Down(), 1.1);
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

    this.collider.position.y += this.jumpVelocity * deltaTime;
    this.jumpVelocity += this.scene.gravity.y * deltaTime * 3;

    this.avatar.position.copyFrom(this.collider.position);
    this.avatar.position.y += 0.9;

    if (this.isGrounded() && this.jumpVelocity <= 0) {
      this.jumpVelocity = 0;
      this.airborne = false;
    }
  }

  dispose(): void {
    this.scene.onBeforeRenderObservable.remove(this.beforeRenderObserver);
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
    this.canvas.removeEventListener("click", this.onCanvasClick);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.releasePointerLock();
    if (this.controlsAttached) {
      this.camera.detachControl();
    }
    this.camera.dispose();
    this.avatar.dispose();
    this.collider.dispose();
  }
}
