import {
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Scene,
  Vector3,
} from "babylonjs";
import { FacultyBuilding } from "@/building/FacultyBuilding";
import { PlayerController } from "@/player/PlayerController";
import {
  loadPlayerSettings,
  PlayerSettings,
} from "@/settings/playerSettings";

export class FacultyScene {
  private engine: Engine;
  private scene: Scene;
  private player: PlayerController | null = null;
  private readonly onResize: () => void;
  private settings: PlayerSettings;

  constructor(private canvas: HTMLCanvasElement) {
    this.settings = loadPlayerSettings();
    this.engine = new Engine(this.canvas, true);
    this.scene = this.createScene();
    this.setupLighting();

    const building = new FacultyBuilding(this.scene);
    this.player = new PlayerController(
      this.scene,
      this.canvas,
      building.spawnPosition,
      this.settings
    );

    this.onResize = () => {
      this.engine.resize();
    };
    window.addEventListener("resize", this.onResize);

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  applyPlayerSettings(settings: PlayerSettings): void {
    this.settings = settings;
    this.player?.applySettings(settings);
  }

  setInputActive(active: boolean): void {
    this.player?.setInputActive(active);
  }

  requestPointerLock(): void {
    this.player?.requestPointerLock();
  }

  isPointerLocked(): boolean {
    return this.player?.isPointerLocked() ?? false;
  }

  private createScene(): Scene {
    const scene = new Scene(this.engine);
    scene.clearColor = new Color4(0.53, 0.75, 0.92, 1);
    scene.fogMode = Scene.FOGMODE_LINEAR;
    scene.fogColor = new Color3(0.7, 0.82, 0.92);
    scene.fogStart = 40;
    scene.fogEnd = 120;
    return scene;
  }

  private setupLighting(): void {
    const hemi = new HemisphericLight(
      "hemi",
      new Vector3(0, 1, 0),
      this.scene
    );
    hemi.intensity = 0.85;
    hemi.groundColor = new Color3(0.35, 0.35, 0.38);

    const sun = new DirectionalLight(
      "sun",
      new Vector3(-0.5, -1, 0.3),
      this.scene
    );
    sun.position = new Vector3(20, 40, -10);
    sun.intensity = 0.55;
  }

  dispose(): void {
    window.removeEventListener("resize", this.onResize);
    this.player?.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }
}
