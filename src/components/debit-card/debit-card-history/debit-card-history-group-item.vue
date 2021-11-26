<template>
  <div class="item">
    <div class="icon action">
      <span>{{ icon }}</span>
    </div>
    <div class="description">
      {{ description }}
    </div>
    <div class="icon checkmark">✔️</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'DebitCardHistoryGroupItem',
  props: {
    icon: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }
});
</script>
