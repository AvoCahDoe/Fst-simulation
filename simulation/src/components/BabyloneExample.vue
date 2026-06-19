<template>
  <div class="container">
    <div class="viewport">
      <canvas ref="canvasRef"></canvas>
      <div v-if="showHint" class="hint" @click="dismissHint">
        Click to play — WASD to move, mouse to look, Esc to unlock
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { FacultyScene } from "@/Scenes/FacultyScene";

export default defineComponent({
  name: "BabyloneExamples",
  setup() {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const showHint = ref(true);
    let facultyScene: FacultyScene | null = null;

    const dismissHint = () => {
      showHint.value = false;
      canvasRef.value?.focus();
    };

    onMounted(() => {
      if (canvasRef.value) {
        facultyScene = new FacultyScene(canvasRef.value);
        canvasRef.value.addEventListener("click", dismissHint, { once: true });
      }
    });

    onUnmounted(() => {
      facultyScene?.dispose();
      facultyScene = null;
    });

    return { canvasRef, showHint, dismissHint };
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
  cursor: crosshair;
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
}
</style>
