<template>
  <div class="item">
    <div class="info">
      <div class="icon"><span>🗳</span></div>
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
    <div class="action">
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
import { mapGetters } from 'vuex';

import dayjs from 'dayjs';

import { Proposal } from '@/services/mover/governance';
import { ProposalState } from '@/store/modules/governance/types';

import { ProgressLoader } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceProposalsItem',
  components: {
    ProgressLoader
  },
  props: {
    item: {
      type: Object as PropType<Proposal>,
      required: true
    }
  },
  computed: {
    ...mapGetters('governance', {
      proposalStateRaw: 'proposalState'
    }),
    statusText(): string {
      if (this.item.state === 'closed') {
        return this.$t('governance.lblVotingStatus.closed').toString();
      }

      return this.$t('governance.lblVotingStatus.active').toString();
    },
    buttonText(): string {
      if (this.item.state === 'closed') {
        return this.$t('governance.btnView.text').toString();
      }

      return this.$t('governance.btnVote.simple').toString();
    },
    proposalState(): ProposalState {
      return this.proposalStateRaw(this.item.id);
    },
    strokeColor(): string {
      switch (this.proposalState) {
        case 'accepted':
          return '#30be16';
        case 'defeated':
          return '#ff585f';
        default:
          return '#000';
      }
    },
    itemProgress(): number {
      if (['accepted', 'defeated'].includes(this.proposalState)) {
        return 100;
      }

      const elapsed = dayjs().unix() - this.item.start;
      const proposalLifeSpan = this.item.end - this.item.start;

      return Math.round(100 * (elapsed / proposalLifeSpan));
    }
  }
});
</script>
