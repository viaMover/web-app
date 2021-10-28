<template>
  <custom-picture />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Skin } from '@/store/modules/debit-card/types';

import { CustomPicture } from '@/components/html5';

export default Vue.extend({
  name: 'DebitCardImage',
  components: {
    CustomPicture
  },
  props: {
    skin: {
      type: Object as PropType<Skin>,
      required: true
    }
  }
});
</script>
