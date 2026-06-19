<template>
  <div class="play-menu">
    <div class="play-menu-card">
      <h1>FST Campus Simulation</h1>
      <p class="subtitle">Faculté des Sciences et Techniques — Beni Mellal</p>

      <button class="menu-btn primary" type="button" @click="$emit('play')">
        Play
      </button>
      <button class="menu-btn" type="button" @click="$emit('open-settings')">
        Settings
      </button>

      <p class="hint">
        WASD to move · Space to jump · mouse to look · Esc for settings
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PlayMenu",
  emits: ["play", "open-settings"],
});
</script>

<style scoped>
.play-menu {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 12, 24, 0.72);
  z-index: 15;
}

.play-menu-card {
  text-align: center;
  padding: 2.5rem 3rem;
  background: #1e1e2e;
  border: 1px solid #3a3a55;
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
  max-width: 420px;
  width: 90%;
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  color: #f0f0f8;
}

.subtitle {
  margin: 0 0 2rem;
  font-size: 0.9rem;
  color: #9a9ab0;
}

.menu-btn {
  display: block;
  width: 100%;
  padding: 0.85rem 1.5rem;
  margin-bottom: 0.75rem;
  border-radius: 8px;
  border: 1px solid #4a4a65;
  background: #2a2a40;
  color: #e8e8f0;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-btn:hover {
  background: #353550;
}

.menu-btn.primary {
  background: #3d6fd4;
  border-color: #3d6fd4;
  color: #fff;
  font-weight: 600;
}

.menu-btn.primary:hover {
  background: #4a7de0;
}

.hint {
  margin: 1.5rem 0 0;
  font-size: 0.8rem;
  color: #7a7a95;
  line-height: 1.5;
}
</style>
