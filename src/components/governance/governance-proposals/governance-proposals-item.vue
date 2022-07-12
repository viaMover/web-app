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

import { Proposal, ProposalStatus } from '@/services/v2/api/mover/governance';

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
    strokeColor(): string {
      switch (this.item.status) {
        case ProposalStatus.Passed:
          return '#30be16';
        case ProposalStatus.Rejected:
          return '#ff585f';
        default:
          return '#000';
      }
    },
    itemProgress(): number {
      if (
        [ProposalStatus.Passed, ProposalStatus.Rejected].includes(
          this.item.status
        )
      ) {
        return 100;
      }

      const elapsed = dayjs().unix() - this.item.startTs;
      const proposalLifeSpan = this.item.endTs - this.item.startTs;

      return Math.round(100 * (elapsed / proposalLifeSpan));
    }
  }
});
</script>
