<template>
  <div id="app">
    <div class="grid-container">
      <div class="header">
        Header Menue
        <br>
        <!-- <button v-on:click="changeTitle">toggleTitle</button> -->
        </div>
      <div class="ts-ws-pane">TSs and WSs</div>
      <div class="file-explorer">File explorer</div>
    </div>
  </div>
</template>

<script lang="ts">
// const {ipcRenderer} = require("electron");

  export default {
    name: 'app',
    data() {
      return {
         message: "Hi GDrive",
      }
    },
    computed: {
      nodeVersion: function(): string {
        return process.versions.node;
      },
      chromeVersion: function(): string {
        return process.versions.chrome;
      },
      electronVersion: function(): string {
        return process.versions.electron;
      },
      electronPath: function(): string {
        return require.resolve("electron");
      }
    },
    methods: {
    },
  };
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
