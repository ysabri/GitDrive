<template>
  <div id="app">
    <div class="grid-container">
      <div class="header">
        Header Menue
        <br>
        <!-- <button v-on:click="changeTitle">toggleTitle</button> -->
        FirstTime? {{fTime}} ??
      </div>
      <TwsPane v-if="fTime" class="ts-ws-pane" v-bind:TSs="[]"></TwsPane>
      <TwsPane v-else class="ts-ws-pane" v-bind:TSs="TSs"></TwsPane>
      <div class="file-explorer">File explorer</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { readFtime, readTSs } from "../store"
import Component from "vue-class-component";
import TwsPane from "./twssPane.vue";
import { TopicSpace } from "model/app/topicspace";

@Component({
  components: {
    TwsPane,
  }
})
export default class App extends Vue {

  get fTime(): boolean {
    return readFtime(this.$store);
  }
  get TSs(): TopicSpace[] | undefined {
    return readTSs(this.$store) as TopicSpace[];
  }
  get testCompute(): any {
    return this.$store.state;
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
  .header { grid-area: head; }
  .ts-ws-pane {
    grid-area: pane;
    background-color: forestgreen;
    text-align: center;
    padding: 20px 0;
    font-size: 20px;
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
