import Vue from 'vue';
import { mapActions } from 'vuex';

export const GasListenerMixin = Vue.extend({
  data() {
    return {
      gasListenerId: 'no_name_provided'
    };
  },
  async beforeMount() {
    if (this.$options?.name !== undefined) {
      this.gasListenerId = this.$options.name;
    }

    await this.startGasListening(this.gasListenerId);
  },
  async beforeDestroy() {
    await this.stopGasListening(this.gasListenerId);
  },
  methods: {
    ...mapActions('account', {
      startGasListening: 'startGasListening',
      stopGasListening: 'stopGasListening'
    })
  }
});
