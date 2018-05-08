<template>
    <div v-if="currRepo === undefined">
        <button class="left-buttons">New Repository</button>
        <button class="left-buttons" v-on:click="addRepo">Add Repository</button>
    </div>
    <div v-else>
        <button class="left-buttons">Add TopicSpace</button>
        <button class="left-buttons">Add WorkSpace</button>
        <button class="right-buttons">Sync</button>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component  from "vue-class-component";
import { TopicSpace } from '../model/app/topicspace';
import { GRepository } from 'model/app/g-repository';
import { commitCurrRepo, readCurrRepo, dispatchloadRepo } from "../store";

@Component({
    props: {
        TSs: Array,
        }
})
export default class HeaderMenue extends Vue{
    TSs: TopicSpace[];
    get currRepo(): GRepository | undefined {
        return readCurrRepo(this.$store);
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
