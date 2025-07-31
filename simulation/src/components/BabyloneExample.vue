<template>
  <div class="container">
    <h3 class="title">Main Scene</h3>
    <canvas></canvas>
  </div>
</template>



<script lang="ts">
import { defineComponent } from 'vue';
// import { BasicScene } from '@/Scenes/BasicScene';
import { sdMaterials } from '@/Scenes/sdMaterials';
import { PBR } from '@/Scenes/PBR';




export default defineComponent({
  name: 'PBR',
  mounted(){
    
    const canvas = document.querySelector("canvas");
    
    if (canvas != null){
        new sdMaterials(canvas);
    }
    
  }

});
</script>


<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(to right, #f0f2f5, #dbe2ef);
  padding: 2rem;
  box-sizing: border-box;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: #1e2a38;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


canvas {
  width: 90%;
  max-width: 1200px;
  height: 70vh;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #ccc;
  transition: transform 0.3s ease;
}

</style>