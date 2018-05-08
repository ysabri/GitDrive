<template>
    <div>
        <ul>
            <li v-for="TS of TSs">
                {{TS.name}}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import { readTSs } from "../store";
import Component  from "vue-class-component";
import { TopicSpace } from '../model/app/topicspace';

@Component({
    props: {
        TSs: Array,
    }
})
export default class TwsPane extends Vue{
    TSs: Array<TopicSpace>;
};
</script>

<style scoped>

</style>
