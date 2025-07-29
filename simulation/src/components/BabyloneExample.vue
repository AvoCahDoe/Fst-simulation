<template>



<h3>Babylon Exemples</h3>

<canvas>

</canvas>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { BasicScene } from '@/Scenes/BasicScene';

export default defineComponent({
  name: 'BabyloneExample',
  mounted(){
    
    const canvas = document.querySelector("canvas");
    
    if (canvas != null){
        new BasicScene(canvas);
    }
    
  }







  
});
</script>















<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>



canvas {
  width : 70%;
  height: 70%;
}
</style>
