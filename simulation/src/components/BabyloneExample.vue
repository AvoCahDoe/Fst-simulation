<template>
  <div class="container">
    <div class="viewport">
      <canvas
        ref="canvasRef"
        :class="{ playing: isPlaying && !settingsOpen }"
      ></canvas>

      <button
        class="gear-btn"
        type="button"
        title="Settings"
        @click.stop="setSettingsOpen(true)"
      >
        ⚙
      </button>

      <SettingsPanel
        :open="settingsOpen"
        :settings="playerSettings"
        @close="setSettingsOpen(false)"
        @change="onSettingsChange"
      />

      <div v-if="showHint" class="hint" @click="startPlaying">
        Click to play — move with your keys, mouse to look, Esc for settings
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { FacultyScene } from "@/Scenes/FacultyScene";
import SettingsPanel from "@/components/SettingsPanel.vue";
import {
  loadPlayerSettings,
  PlayerSettings,
} from "@/settings/playerSettings";

export default defineComponent({
  name: "BabyloneExamples",
  components: { SettingsPanel },
  setup() {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const showHint = ref(true);
    const settingsOpen = ref(false);
    const isPlaying = ref(false);
    const playerSettings = ref<PlayerSettings>(loadPlayerSettings());
    let facultyScene: FacultyScene | null = null;

    const setSettingsOpen = (open: boolean) => {
      settingsOpen.value = open;
      facultyScene?.setSettingsActive(open);
      if (open) {
        isPlaying.value = false;
      }
    };

    const startPlaying = () => {
      showHint.value = false;
      canvasRef.value?.focus();
      facultyScene?.setSettingsActive(false);
      facultyScene?.requestPointerLock();
    };

    const onSettingsChange = (settings: PlayerSettings) => {
      playerSettings.value = settings;
      facultyScene?.applyPlayerSettings(settings);
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvasRef.value;
      isPlaying.value = locked;
      if (locked) {
        showHint.value = false;
        if (settingsOpen.value) {
          setSettingsOpen(false);
        }
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Escape") return;

      if (settingsOpen.value) {
        setSettingsOpen(false);
        return;
      }

      if (document.pointerLockElement === canvasRef.value) {
        setSettingsOpen(true);
      }
    };

    onMounted(() => {
      if (canvasRef.value) {
        facultyScene = new FacultyScene(canvasRef.value);
      }
      document.addEventListener("pointerlockchange", onPointerLockChange);
      window.addEventListener("keydown", onKeyDown);
    });

    onUnmounted(() => {
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      window.removeEventListener("keydown", onKeyDown);
      facultyScene?.dispose();
      facultyScene = null;
    });

    return {
      canvasRef,
      showHint,
      settingsOpen,
      isPlaying,
      playerSettings,
      setSettingsOpen,
      startPlaying,
      onSettingsChange,
    };
  },
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #1a1a2e;
  padding: 0;
  box-sizing: border-box;
}

.viewport {
  position: relative;
  width: 100vw;
  height: 100vh;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
  cursor: default;
}

canvas.playing {
  cursor: none;
}

.gear-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
}

.gear-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  pointer-events: auto;
  cursor: pointer;
  user-select: none;
  z-index: 5;
}
</style>
