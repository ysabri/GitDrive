<template>
    <div>
        <ul>
            <li v-for="TS of TSs">
                {{TS.name}}
                <Wspane v-bind:users="TS.users"></Wspane>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component  from "vue-class-component";
import {
    TopicSpace,
    User,
} from '../model/app';
import Wspane  from "./wspane.vue";

@Component({
    components: {
        Wspane,
    },
    props: {
        users: Array,
        TSs: Array,
    }
})
export default class TwsPane extends Vue{
    users: Array<User>;
    TSs: Array<TopicSpace>;
};
</script>

<style scoped>


</style>
