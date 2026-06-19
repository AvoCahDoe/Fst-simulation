<template>
  <div v-if="open" class="settings-overlay" @click.self="close">
    <div class="settings-panel">
      <div class="settings-header">
        <h2>Settings</h2>
        <button class="close-btn" type="button" @click="close">×</button>
      </div>

      <div class="settings-body">
        <label class="field">
          <span>Player speed ({{ local.speed.toFixed(2) }})</span>
          <input
            v-model.number="local.speed"
            type="range"
            :min="SPEED_MIN"
            :max="SPEED_MAX"
            step="0.01"
            @input="emitChange"
          />
        </label>

        <label class="field">
          <span>FOV ({{ local.fov }}°)</span>
          <input
            v-model.number="local.fov"
            type="range"
            min="60"
            max="110"
            step="1"
            @input="emitChange"
          />
        </label>

        <label class="field">
          <span>Camera sensitivity ({{ local.sensitivity.toFixed(1) }})</span>
          <input
            v-model.number="local.sensitivity"
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            @input="emitChange"
          />
        </label>

        <label v-if="!local.flying" class="field">
          <span>Jump force ({{ local.jumpForce.toFixed(2) }})</span>
          <input
            v-model.number="local.jumpForce"
            type="range"
            :min="JUMP_FORCE_MIN"
            :max="JUMP_FORCE_MAX"
            step="0.05"
            @input="emitChange"
          />
        </label>

        <label class="field toggle-field">
          <span>Flying mode</span>
          <input
            v-model="local.flying"
            type="checkbox"
            @change="emitChange"
          />
        </label>

        <div class="keybinds">
          <h3>Movement keys</h3>
          <div
            v-for="bind in keybindFields"
            :key="bind.key"
            class="keybind-row"
          >
            <span>{{ bind.label }}</span>
            <button
              type="button"
              class="key-btn"
              :class="{ listening: listeningFor === bind.key }"
              @click="startListening(bind.key)"
            >
              {{
                listeningFor === bind.key
                  ? "Press a key…"
                  : formatKeyLabel(local.keys[bind.key])
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, PropType, reactive, ref, watch } from "vue";
import {
  formatKeyLabel,
  JUMP_FORCE_MAX,
  JUMP_FORCE_MIN,
  loadPlayerSettings,
  PlayerKeyBinds,
  PlayerSettings,
  savePlayerSettings,
  SPEED_MAX,
  SPEED_MIN,
} from "@/settings/playerSettings";

type KeyField = keyof PlayerKeyBinds;

export default defineComponent({
  name: "SettingsPanel",
  props: {
    open: { type: Boolean, required: true },
    settings: {
      type: Object as PropType<PlayerSettings>,
      required: true,
    },
  },
  emits: ["close", "change"],
  setup(props, { emit }) {
    const local = reactive<PlayerSettings>(loadPlayerSettings());
    const listeningFor = ref<KeyField | null>(null);

    const keybindFields = computed(() => {
      const base: { key: KeyField; label: string }[] = [
        { key: "forward", label: "Forward" },
        { key: "backward", label: "Backward" },
        { key: "left", label: "Left" },
        { key: "right", label: "Right" },
      ];
      if (local.flying) {
        base.push(
          { key: "flyUp", label: "Fly up" },
          { key: "flyDown", label: "Fly down" }
        );
      } else {
        base.push({ key: "flyUp", label: "Jump" });
      }
      return base;
    });

    watch(
      () => props.settings,
      (value) => {
        Object.assign(local, value);
        local.keys = { ...value.keys };
      },
      { deep: true }
    );

    const emitChange = () => {
      savePlayerSettings(local);
      emit("change", { ...local, keys: { ...local.keys } });
    };

    const close = () => {
      listeningFor.value = null;
      emit("close");
    };

    const startListening = (field: KeyField) => {
      listeningFor.value = field;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!listeningFor.value) return;
      if (event.code === "Escape") {
        listeningFor.value = null;
        return;
      }
      event.preventDefault();
      local.keys[listeningFor.value] = event.code;
      listeningFor.value = null;
      emitChange();
    };

    onMounted(() => {
      window.addEventListener("keydown", onKeyDown);
    });

    onUnmounted(() => {
      window.removeEventListener("keydown", onKeyDown);
    });

    return {
      local,
      listeningFor,
      keybindFields,
      formatKeyLabel,
      emitChange,
      close,
      startListening,
      SPEED_MIN,
      SPEED_MAX,
      JUMP_FORCE_MIN,
      JUMP_FORCE_MAX,
    };
  },
});
</script>

<style scoped>
.settings-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.settings-panel {
  width: min(420px, 92vw);
  max-height: 90vh;
  overflow-y: auto;
  background: #1e1e2e;
  color: #e8e8f0;
  border-radius: 12px;
  border: 1px solid #3a3a55;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #3a3a55;
}

.settings-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.settings-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.field input[type="range"] {
  width: 100%;
  accent-color: #5b8def;
}

.toggle-field {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.toggle-field input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #5b8def;
}

.keybinds h3 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: #aaa;
}

.keybind-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.key-btn {
  min-width: 90px;
  padding: 0.35rem 0.75rem;
  background: #2a2a40;
  border: 1px solid #4a4a65;
  border-radius: 6px;
  color: #e8e8f0;
  cursor: pointer;
  font-size: 0.85rem;
}

.key-btn.listening {
  border-color: #5b8def;
  color: #5b8def;
}

.key-btn:hover {
  background: #353550;
}
</style>
