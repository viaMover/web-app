<template>
  <heading-section
    class="links__item"
    has-expand-button
    :name="$t('releaseRadar.lblReleaseRadar')"
    navigate-to-name="release-radar"
  >
    <template v-slot:heading>
      {{ $t('releaseRadar.lblReleaseRadar') }}
    </template>

    <p>
      {{
        $t('releaseRadar.lblReleaseRadarNewTokensToday', {
          amount: newTokensToday
        })
      }}
    </p>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';

import HeadingSection from './heading-section.vue';

export default Vue.extend({
  name: 'ReleaseRadarSection',
  components: {
    HeadingSection
  },
  data() {
    return {
      newTokensToday: 34
    };
  }
});
</script>
