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
import { PlayerSettings } from "@/settings/playerSettings";

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
  private jumpVelocity = 0;
  private airborne = false;
  private yaw = 0;
  private pitch = 0;
  private readonly keysPressed = new Set<string>();
  private readonly onPointerLockChange: () => void;
  private readonly onCanvasClick: () => void;
  private readonly onKeyDown: (event: KeyboardEvent) => void;
  private readonly onKeyUp: (event: KeyboardEvent) => void;
  private readonly onMouseMove: (event: MouseEvent) => void;
  private readonly onWindowBlur: () => void;
  private readonly onVisibilityChange: () => void;
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
    this.collider.position.y += 0.9;
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
    this.syncAvatarPosition();

    this.camera = new UniversalCamera("player", this.getEyePosition(), scene);
    this.camera.minZ = 0.1;
    this.camera.inputs.clear();

    this.onPointerLockChange = () => {
      this.pointerLocked =
        document.pointerLockElement === this.canvas;
      if (!this.pointerLocked) {
        this.clearKeys();
      }
    };

    this.onCanvasClick = () => {
      if (!this.inputActive) return;
      this.requestPointerLock();
    };

    this.onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      if (!this.inputActive) return;

      this.keysPressed.add(event.code);

      if (this.settings.flying) return;
      if (event.code !== this.settings.keys.flyUp) return;
      if (!this.isGrounded() || this.airborne) return;
      this.jumpVelocity = this.settings.jumpForce;
      this.airborne = true;
    };

    this.onKeyUp = (event: KeyboardEvent) => {
      this.keysPressed.delete(event.code);
      if (event.code === "AltLeft" || event.code === "AltRight") {
        this.keysPressed.delete("AltLeft");
        this.keysPressed.delete("AltRight");
      }
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        this.keysPressed.delete("ShiftLeft");
        this.keysPressed.delete("ShiftRight");
      }
    };

    this.onMouseMove = (event: MouseEvent) => {
      if (!this.inputActive || document.pointerLockElement !== this.canvas) {
        return;
      }

      const scale = this.settings.sensitivity / 2000;
      this.yaw -= event.movementX * scale;
      this.pitch -= event.movementY * scale;

      if (this.settings.cameraMode === "first") {
        this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch));
      } else {
        this.pitch = Math.max(-0.4, Math.min(0.7, this.pitch));
      }
    };

    this.onWindowBlur = () => this.clearKeys();
    this.onVisibilityChange = () => {
      if (document.hidden) this.clearKeys();
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
    document.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("blur", this.onWindowBlur);
    document.addEventListener("visibilitychange", this.onVisibilityChange);

    this.applySettings(settings);
    this.setInputActive(false);
  }

  isPointerLocked(): boolean {
    return this.pointerLocked;
  }

  clearKeys(): void {
    this.keysPressed.clear();
  }

  setInputActive(active: boolean): void {
    this.inputActive = active;

    if (!active) {
      this.releasePointerLock();
      this.jumpVelocity = 0;
      this.airborne = false;
      this.clearKeys();
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

    this.camera.fov = (settings.fov * Math.PI) / 180;

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
    const forward = new Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
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

    move.normalize().scale(this.settings.speed * deltaTime);

    if (this.settings.flying) {
      this.collider.position.addInPlace(move);
    } else {
      this.collider.moveWithCollisions(move);
    }

    this.syncAvatarPosition();
  }

  private syncAvatarPosition(): void {
    this.avatar.position.copyFrom(this.collider.position);
    this.avatar.position.y += 0.9;
    this.avatar.rotation.y = this.yaw;
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
      this.camera.rotation.x = this.pitch;
      this.camera.rotation.y = this.yaw;
      this.camera.rotation.z = 0;
      return;
    }

    this.avatar.isVisible = true;
    this.syncAvatarPosition();

    const dist = this.settings.thirdPersonDistance;
    const camHeight = THIRD_CAM_HEIGHT + this.pitch * 2;
    const offsetX = Math.sin(this.yaw) * dist;
    const offsetZ = Math.cos(this.yaw) * dist;

    const desiredPos = new Vector3(
      feet.x + offsetX,
      feet.y + camHeight,
      feet.z + offsetZ
    );

    this.camera.position.copyFrom(
      this.resolveThirdPersonPosition(feet, desiredPos)
    );

    const target = new Vector3(
      feet.x,
      feet.y + THIRD_TARGET_HEIGHT,
      feet.z
    );
    this.camera.setTarget(target);
  }

  private resolveThirdPersonPosition(
    feet: Vector3,
    desiredPos: Vector3
  ): Vector3 {
    const target = new Vector3(
      feet.x,
      feet.y + THIRD_TARGET_HEIGHT,
      feet.z
    );
    const dir = desiredPos.subtract(target);
    const maxDist = dir.length();
    if (maxDist < 0.01) return desiredPos;

    dir.normalize();
    const ray = new Ray(target, dir, maxDist);
    const pick = this.scene.pickWithRay(ray, (mesh) => {
      return mesh.checkCollisions && mesh !== this.avatar && mesh !== this.collider;
    });

    if (pick?.hit && pick.distance !== undefined && pick.distance < maxDist) {
      return target.add(dir.scale(Math.max(0.8, pick.distance - 0.3)));
    }

    return desiredPos;
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

    this.syncAvatarPosition();

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
    document.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("blur", this.onWindowBlur);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.releasePointerLock();
    this.camera.dispose();
    this.avatar.dispose();
    this.collider.dispose();
  }
}
