<template>
  <div v-if="!isLoading" class="gas-selector" @click="toggleGasPrice">
    <div class="network-fee">
      <div class="price-container">{{ networkFee }}</div>
      <div class="subtitle">{{ $t('gas.lblNetworkFee') }}</div>
    </div>
    <div class="select-group">
      <div class="indicators">
        <span
          v-for="price in gasPrices"
          :key="price.type"
          class="option"
          :class="{ active: price === selectedGasPrice }"
        />
      </div>
      <div class="title">
        {{ $t(`gas.lblSelector.${selectedGasPrice.type}`) }}
      </div>
      <div class="details">
        <span>{{ gasPriceInGwei }}</span>
        <span>
          {{ estimatedTimeSign }}
          {{ estimatedTimeValue }}
          {{ estimatedTimeUnit }}
        </span>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="loader">Price is loading</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export type GasPrice = {
  type: 'high' | 'low' | 'normal' | 'custom' | 'treasury';
  amount: number;
  txFee: {
    native: {
      value: {
        amount: number;
      };
    };
    value: {
      amount: number;
    };
  };
};

export default Vue.extend({
  name: 'GasSelector',
  data() {
    return {
      selectedGasPriceIndex: 0,
      isLoading: false
    };
  },
  computed: {
    nativeCurrencySymbol(): string {
      return '$';
    },
    gasPriceInGwei(): string {
      if (this.selectedGasPrice === null) {
        return '';
      }

      return `${this.selectedGasPrice.amount} Gwei`;
    },
    networkFee(): string {
      if (this.selectedGasPrice === null) {
        return '';
      }

      return `${this.nativeCurrencySymbol}${this.selectedGasPrice.txFee.native.value.amount}`;
    },
    estimatedTimeValue(): string {
      return '43';
    },
    estimatedTimeUnit(): string {
      return 'sec';
    },
    estimatedTimeSign(): string {
      return '~';
    },
    gasPrices(): Array<GasPrice> {
      return [
        {
          type: 'high',
          amount: 73,
          txFee: {
            native: {
              value: {
                amount: 43.25
              }
            },
            value: {
              amount: 21000
            }
          }
        }
      ];
    },
    selectedGasPrice(): GasPrice {
      return {
        type: 'high',
        amount: 73,
        txFee: {
          native: {
            value: {
              amount: 43.25
            }
          },
          value: {
            amount: 21000
          }
        }
      };
    }
  },
  methods: {
    toggleGasPrice() {
      this.selectedGasPriceIndex =
        (this.selectedGasPriceIndex + 1) % this.gasPrices.length;
      this.$nextTick(() => {
        this.$emit('selected-gas-changed', this.selectedGasPrice);
      });
    }
  }
});
</script>

<style lang="less">
.gas-selector {
  margin-top: 1rem;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;

  .network-fee {
    flex-basis: 20%;
    flex-grow: 1;
  }

  .select-group {
    flex-shrink: 1;
    flex-grow: 0;
  }
}
</style>
