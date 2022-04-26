<template>
  <div class="item">
    <div class="info">
      <div class="icon">
        <custom-picture
          :sources="icon.sources"
          :src="icon.src"
          :webp-sources="icon.webpSources"
        />
      </div>
      <progress-loader
        class="progress-loader"
        :is-animated="itemProgress !== 100"
        :stroke-color="strokeColor"
        :value="itemProgress"
      />
      <div class="text">
        <h3 class="title">{{ item.title }}</h3>
        <div class="description">{{ statusText }}</div>
      </div>
    </div>
    <div v-if="!hideNavLink" class="action">
      <router-link
        class="button"
        :class="{ primary: item.state !== 'closed' }"
        :to="{ name: 'governance-view', params: { id: item.id } }"
      >
        {{ buttonText }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import iconDark from '@/assets/images/icons/governance/dark';
import iconLight from '@/assets/images/icons/governance/light';
import { Proposal } from '@/services/mover/governance';
import { Theme } from '@/settings/theme';
import { ProposalState } from '@/store/modules/governance/types';

import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import { ProgressLoader } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceProposalsItem',
  components: {
    CustomPicture,
    ProgressLoader
  },
  props: {
    item: {
      type: Object as PropType<Proposal>,
      required: true
    },
    hideNavLink: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      currentTheme: 'theme'
    }),
    ...mapGetters('governance', {
      proposalStateRaw: 'proposalState'
    }),
    statusText(): string {
      if (this.item.state === 'closed') {
        return this.$t('votingStatusClosed').toString();
      }

      return this.$t('votingStatusActive').toString();
    },
    buttonText(): string {
      if (this.item.state === 'closed') {
        return this.$t('view').toString();
      }

      return this.$t('vote').toString();
    },
    proposalState(): ProposalState {
      return this.proposalStateRaw(this.item.id);
    },
    strokeColor(): string {
      switch (this.proposalState) {
        case 'accepted':
          return 'var(--governance-accepted)';
        case 'defeated':
          return 'var(--governance-defeated)';
        default:
          return 'var(--governance-default)';
      }
    },
    itemProgress(): number {
      if (['accepted', 'defeated'].includes(this.proposalState)) {
        return 100;
      }

      const elapsed = dayjs().unix() - this.item.start;
      const proposalLifeSpan = this.item.end - this.item.start;

      return Math.round(100 * (elapsed / proposalLifeSpan));
    },
    icon(): PictureDescriptor {
      return this.currentTheme === Theme.Light ? iconLight : iconDark;
    }
  }
});
</script>
