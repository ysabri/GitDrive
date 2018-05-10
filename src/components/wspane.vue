<template>
  <div>
      <li v-for="user of users">
          {{user.name}}
      </li>
  </div>
</template>


<script lang="ts">
import Vue from 'vue'
import Component from "vue-class-component";
import { User } from 'model/app';

@Component({
    props: {
        users: Array,
    },
})
export default class Wspane extends Vue{
    users: Array<User>;
}
</script>
