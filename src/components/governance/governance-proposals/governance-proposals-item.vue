<template>
  <div class="item__column">
    <div class="item__column-info active">
      <div class="loading">
        <div class="hold left">
          <div class="fill"></div>
        </div>
        <div class="hold right">
          <div class="fill"></div>
        </div>
      </div>
      <div class="item__column-info-icon"><span>🗳</span></div>
      <div class="item__column-info-label">
        <p>{{ item.title }}</p>
        <span>{{ statusText }}</span>
      </div>
    </div>
    <div class="item__column-link">
      <router-link
        class="black-link button-active"
        :to="{ name: 'governance-view', params: { id: item.id } }"
      >
        {{ buttonText }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Proposal } from '@/services/mover/governance';

export default Vue.extend({
  name: 'GovernanceProposalsItem',
  props: {
    item: {
      type: Object as PropType<Proposal>,
      required: true
    }
  },
  computed: {
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
    }
  }
});
</script>
