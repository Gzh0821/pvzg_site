<template>
  <div class="plant-detail" v-if="plant">
    <!-- <img :src="plant.image" :alt="plant.name" />
    <p>{{ plant.description }}</p> -->
    <div class="details-container">
      <div class="plant-image">
        <img src="https://static.wikia.nocookie.net/plantsvszombies/images/c/ca/Peashooter2.png" :alt="plant.name" />
        <h3>{{ plant.name }}</h3>
      </div>
      <div class="plant-stats">
        <table>
          <tbody>
            <tr v-for="(value, key) in plant.elements" :key="key">
              
              <td class="ability"><img :src="keyMap[key].icon"/> {{ keyMap[key].zh }}</td>
              <td class="value">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p class="description">{{ plant.description }}</p>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import type { Plant, KeyMap } from '../types';


// 接收 props
defineProps<{ plant: Plant, keyMap: KeyMap }>();
</script>

<style scoped>
.plant-detail {
  height: auto;
  margin-left: 20px;
}

p {
  font-size: 14px;
  color: #666;
}

h3 {
  font-family: 'pvzgFont';
}

.details-container {
  display: flex;
  padding: 2%;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 10px;
  background-color: #aa6f42;
  border: 2px solid rgba(0, 0, 0, 0.8);
  box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 12px
}

.plant-image {
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  padding: 10px;
  margin-right: 10px;
  background-color: #ede5c4;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 12px
}

.plant-image img {
  width: 150px;
  height: 150px;
  border-radius: 40px;
  border:3px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: transform 0.25s ease-in-out, opacity 0.25s ease-in-out;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 12px
}

.plant-stats {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-left: 20px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #ede5c4;
  box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 12px
  /* 隐藏超出部分 */

}

table {
  display: flex;
  justify-content: center;
  width: 100%;
  border-collapse: separate;
}

table tbody tr {
  background-color: #61ac66;
  border-radius: 5px;
}

table tbody tr:nth-child(even) {
  background-color: #3a6e3d;
}

table tbody td img{
  object-fit: contain;
  vertical-align: middle;
  height: 32px;
}

table tbody td.ability {
  color: #d8d8d8;
  font-weight: bold;
  font-family: 'pvzgFont';
  font-size: large;
  border-radius: 7% 0 0 7%;
  text-shadow: 0px -1px 1px black, 0px 1px 1px black, 1px 0px 1px black, -1px 0px 0px black, 1px 2px 1px black;
}

table tbody td.value {
  color: white;
  font-weight: bold;
  font-family: 'pvzgFont';
  font-size: larger;
  border-radius: 0 7% 7% 0;
  text-shadow: 0px -1px 1px black, 0px 1px 1px black, 1px 0px 1px black, -1px 0px 0px black, 1px 2px 1px black;
}

.ability {
  color: #80ea4c;
  font-weight: bold;
}

.description {
  font-size: 14px;
  color: #bbb;
}

@media (max-width: 768px) {
  .details-container {
    flex-direction: column;
  }

  .plant-image {
    align-items: center;
    margin-right: 0;
    margin-bottom: 10px;
  }
  .plant-stats {
    padding-left: 0;
  }
}
</style>