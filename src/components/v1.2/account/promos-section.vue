<template>
  <base-section :heading-text="$t('promos')" name="analytics"> </base-section>
</template>

<script lang="ts">
import Vue from 'vue';

import BaseSection from './base-section.vue';

export default Vue.extend({
  components: { BaseSection }
});
</script>
