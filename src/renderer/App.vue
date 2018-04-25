<template>
  <div id="app">
    {{message}}
    <h1>Hello World!!!</h1>
    We are using Node.js {{nodeVersion}},
    <br>
    Chromium {{chromeVersion}},
    <br>
    Electron {{electronVersion}},
    <br>
    Electron path {{electronPath}}
    <button id="rl" style="-webkit-app-region: no-drag;" v-on:click="reloadApp">reload</button>

  </div>
</template>

<script lang="ts">
const {ipcRenderer} = require("electron");

  export default {
    name: 'electron-vue',
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
      reloadApp: function() {
        ipcRenderer.send("reload");
      }
    },
  };
</script>

<style>
  /* CSS */
</style>
