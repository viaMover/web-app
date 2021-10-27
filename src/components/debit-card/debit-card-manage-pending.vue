<template>
  <div class="content">
    <div class="container history">
      <div class="group">
        <div class="header">
          <p class="date">August 29</p>
        </div>
        <div class="content">
          <div class="item">
            <div class="icon action">
              <span>🐣</span>
            </div>
            <div class="description">
              You have started your Beautiful Card order process
            </div>
            <div class="icon checkmark">✔</div>
          </div>
        </div>
      </div>

      <div class="group">
        <div class="header">
          <p class="date">Yesterday</p>
        </div>
        <div class="content">
          <div class="item">
            <div class="icon action">
              <span>🤖</span>
            </div>
            <div class="description">
              You have started your KYC process. Beautiful day!
            </div>
            <div class="icon checkmark">✔</div>
          </div>

          <div class="item">
            <div class="icon action">
              <span>💌</span>
            </div>
            <div class="description">
              Your documents have been verified. Lovely!
            </div>
            <div class="icon checkmark">✔</div>
          </div>
        </div>
      </div>

      <div class="group">
        <div class="header">
          <p class="date">Today</p>
        </div>
        <div class="content">
          <div class="item">
            <div class="icon action">
              <span>🚁</span>
            </div>
            <div class="description">
              Your Beautiful Card has been shipped to you
            </div>
            <div class="icon checkmark">✔</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

export default Vue.extend({
  name: 'DebitCardManagePending',
  computed: {
    ...mapState('debitCard', {
      isLoading: 'isActionHistoryLoading'
    }),
    ...mapGetters('debitCard', {
      actionHistory: 'actionHistoryGroupedByDay'
    })
  },
  async mounted() {
    await this.loadActionHistory();
  },
  methods: {
    ...mapActions('debitCard', {
      loadActionHistory: 'loadActionHistory'
    })
  }
});
</script>
