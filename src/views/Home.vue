<template>
    <Calendar />
</template>

<script lang="ts">
import Vue from "vue";
import Calendar from "../components/BCalendar.vue";

export default Vue.extend({
  name: "Home",

  components: {
    Calendar
  },

  data: () => ({
    //
  })
});
</script>
