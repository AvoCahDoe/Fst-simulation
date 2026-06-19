export interface PlayerKeyBinds {
  forward: string;
  backward: string;
  left: string;
  right: string;
  flyUp: string;
  flyDown: string;
}

export type CameraMode = "first" | "third";

export interface PlayerSettings {
  speed: number;
  fov: number;
  sensitivity: number;
  flying: boolean;
  jumpForce: number;
  cameraMode: CameraMode;
  thirdPersonDistance: number;
  keys: PlayerKeyBinds;
}

const STORAGE_KEY = "fst-sim-player-settings";

export const SPEED_MIN = 1;
export const SPEED_MAX = 6;
export const JUMP_FORCE_MIN = 0.2;
export const JUMP_FORCE_MAX = 1.5;
export const THIRD_DIST_MIN = 2;
export const THIRD_DIST_MAX = 10;

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  speed: 2.5,
  fov: 75,
  sensitivity: 1.0,
  flying: false,
  jumpForce: 0.65,
  cameraMode: "first",
  thirdPersonDistance: 5,
  keys: {
    forward: "KeyW",
    backward: "KeyS",
    left: "KeyA",
    right: "KeyD",
    flyUp: "Space",
    flyDown: "AltLeft",
  },
};

const CODE_TO_KEY: Record<string, number> = {
  KeyW: 87,
  KeyA: 65,
  KeyS: 83,
  KeyD: 68,
  KeyQ: 81,
  KeyE: 69,
  KeyR: 82,
  KeyF: 70,
  KeyZ: 90,
  KeyX: 88,
  KeyC: 67,
  KeyV: 86,
  Space: 32,
  ShiftLeft: 16,
  ShiftRight: 16,
  ControlLeft: 17,
  ControlRight: 17,
  AltLeft: 18,
  AltRight: 18,
  ArrowUp: 38,
  ArrowDown: 40,
  ArrowLeft: 37,
  ArrowRight: 39,
};

export function keyCodeFromSetting(code: string): number {
  if (CODE_TO_KEY[code] !== undefined) {
    return CODE_TO_KEY[code];
  }
  if (code.startsWith("Key") && code.length === 4) {
    return code.charCodeAt(3);
  }
  if (code.startsWith("Digit") && code.length === 6) {
    return code.charCodeAt(5);
  }
  return 0;
}

export function formatKeyLabel(code: string): string {
  const labels: Record<string, string> = {
    Space: "Space",
    ShiftLeft: "Shift",
    ShiftRight: "Shift",
    ControlLeft: "Ctrl",
    ControlRight: "Ctrl",
    AltLeft: "Alt",
    AltRight: "Alt",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
  };
  if (labels[code]) return labels[code];
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  return code;
}

function cloneDefaults(): PlayerSettings {
  return {
    ...DEFAULT_PLAYER_SETTINGS,
    keys: { ...DEFAULT_PLAYER_SETTINGS.keys },
  };
}

function normalizeSpeed(value: number | undefined): number {
  let speed = value ?? DEFAULT_PLAYER_SETTINGS.speed;
  // Migrate legacy slider values (0.05–2.0 with old *60 multiplier)
  if (speed < 1) {
    speed *= 20;
  }
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, speed));
}

export function loadPlayerSettings(): PlayerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw) as Partial<PlayerSettings>;
    return {
      speed: normalizeSpeed(parsed.speed),
      fov: parsed.fov ?? DEFAULT_PLAYER_SETTINGS.fov,
      sensitivity: parsed.sensitivity ?? DEFAULT_PLAYER_SETTINGS.sensitivity,
      flying: parsed.flying ?? DEFAULT_PLAYER_SETTINGS.flying,
      jumpForce: Math.min(
        JUMP_FORCE_MAX,
        Math.max(
          JUMP_FORCE_MIN,
          parsed.jumpForce ?? DEFAULT_PLAYER_SETTINGS.jumpForce
        )
      ),
      cameraMode: parsed.cameraMode ?? DEFAULT_PLAYER_SETTINGS.cameraMode,
      thirdPersonDistance: Math.min(
        THIRD_DIST_MAX,
        Math.max(
          THIRD_DIST_MIN,
          parsed.thirdPersonDistance ?? DEFAULT_PLAYER_SETTINGS.thirdPersonDistance
        )
      ),
      keys: { ...DEFAULT_PLAYER_SETTINGS.keys, ...parsed.keys },
    };
  } catch {
    return cloneDefaults();
  }
}

export function savePlayerSettings(settings: PlayerSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
