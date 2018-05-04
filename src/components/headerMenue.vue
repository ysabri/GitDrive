<template>

</template>
<script lang="ts">
import Vue from 'vue'
import Component  from "vue-class-component";
import { TopicSpace } from '../model/app/topicspace';

@Component({
    props: {
        TSs: Array,
    }
})
export default class HeaderMenue extends Vue{
    TSs: TopicSpace[];

};
</script>
<style scoped>

</style>
