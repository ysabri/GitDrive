<template>
    <div v-if="currRepo === undefined">
        <button class="left-buttons">New Repository</button>
        <button class="left-buttons" v-on:click="addRepo">Add Repository</button>
    </div>
    <div v-else>
        <button class="left-buttons" v-on:click="addTS">Add TopicSpace</button>
        <button class="left-buttons" v-on:click="addWS">Add WorkSpace</button>
        <button class="right-buttons" v-on:click="sync">Sync</button>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component  from "vue-class-component";
import { GRepository } from 'model/app';
import {
    commitCurrRepo,
    readCurrRepo,
    dispatchloadRepo,
} from "../store";

@Component({
})
export default class HeaderMenue extends Vue{
    get currRepo(): GRepository | undefined {
        return readCurrRepo(this.$store);
    }
    async addTS(): Promise<void> {
        return;
    }
    async addWS(): Promise<void> {
        return;
    }
    async sync(): Promise<void> {
        return;
    }
    async addRepo(): Promise<void> {
        const repo = await dispatchloadRepo(this.$store);
        commitCurrRepo(this.$store, repo);
    }
};
</script>
<style scoped>
    .left-buttons {
        float: left;
    }
    .right-buttons {
        float: right;
    }
    button {
        background-color:cadetblue;
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        cursor: pointer;
        margin: 0px 3px 0px 0px;
    }
</style>
