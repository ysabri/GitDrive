<template>
  <div id="app">
    <div class="grid-container">
      <div class="header">
        Header Menue
        <br>
        <!-- <button v-on:click="changeTitle">toggleTitle</button> -->
        FirstTime? {{fTime}} ??
        </div>
      <div class="ts-ws-pane">TSs and WSs</div>
      <div class="file-explorer">File explorer</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { readFtime } from "../store"
import Component from "vue-class-component";
@Component
export default class App extends Vue {
  get fTime(): boolean {
    return readFtime(this.$store);
  }
}
</script>

<style>
  #app {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  .header { grid-area: head; }
  .ts-ws-pane { grid-area: pane; }
  .file-explorer { grid-area: explorer; }
  .grid-container {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-areas:
      "head head head head head head"
      "pane pane explorer explorer explorer explorer"
      "pane pane explorer explorer explorer explorer";
    grid-auto-rows: 100px auto auto;
    grid-auto-columns: 12% 12% auto auto auto auto;
    grid-gap: 10px;
    background-color: green;
  }
  .grid-container > div {
    background-color: forestgreen;
    text-align: center;
    padding: 20px 0;
    font-size: 20px;
  }
</style>
