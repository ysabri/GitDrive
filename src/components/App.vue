<template>
  <div id="app">
    <div class="grid-container">
      <HeaderMenue class="header"></HeaderMenue>
      <TwsPane class="ts-ws-pane" v-bind:TSs="TSs"></TwsPane>
      <Fsexplorer class="file-explorer"></Fsexplorer>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  readFtime,
  readTSs,
  readUsers,
} from "../store"
import Component from "vue-class-component";
import TwsPane from "./twssPane.vue";
import Fsexplorer from "./fsExplorer.vue";
import HeaderMenue from "./headerMenue.vue";
import { TopicSpace, User } from "../model/app";

@Component({
  components: {
    TwsPane,
    Fsexplorer,
    HeaderMenue
  }
})
export default class App extends Vue {

  get fTime(): boolean {
    return readFtime(this.$store);
  }
  get TSs(): TopicSpace[] {
    const res = readTSs(this.$store)
    return res === undefined ? []: res as TopicSpace[];
  }
}
</script>


<style scoped>
  #app {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  .header {
    grid-area: head;
  }
  .ts-ws-pane {
    grid-area: pane;
    background-color: forestgreen;
    text-align: center;
    font-size: 20px;
    overflow-y: auto;
  }
  .file-explorer { grid-area: explorer; }
  .grid-container {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-areas:
      "head head head head head head"
      "pane pane explorer explorer explorer explorer"
      "pane pane explorer explorer explorer explorer";
    grid-auto-rows: 70px auto auto;
    grid-auto-columns: 12% 12% auto auto auto auto;
    grid-gap: 10px;
    background-color: green;
  }
  .grid-container > div {
    background-color: forestgreen;
    text-align: center;
    padding: 10px 5px;
    font-size: 20px;
  }
</style>
