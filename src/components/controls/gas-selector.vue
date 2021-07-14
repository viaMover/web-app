<template>
  <div
    v-if="!isLoading"
    class="swaps__wrapper-info-footer"
    @click="toggleGasPrice"
  >
    <div class="swaps__wrapper-info-footer-left">
      <span>{{ networkFee }}</span>
      <p>{{ $t('gas.lblNetworkFee') }}</p>
    </div>
    <div class="swaps__wrapper-info-footer-right">
      <div class="swiper-pagination-bullets">
        <span
          v-for="mode in avaialbleGasModes"
          :key="mode"
          class="swiper-pagination-bullet"
          :class="{
            'swiper-pagination-bullet-active': mode === selectedGasMode
          }"
        />
      </div>
      <p class="speed">
        {{ $t(`gas.lblSelector.${selectedGasMode}`) }}
      </p>
      <span>
        {{ gasPriceInGwei }}
        {{ estimatedTimeSign }}
        {{ estimatedTimeValue }}
        {{ estimatedTimeUnit }}
      </span>
    </div>
  </div>
  <div v-else>
    <div class="loader">Price is loading</div>
  </div>
</template>

<script lang="ts">
import { multiply } from '@/utils/bigmath';
import Vue, { PropType } from 'vue';
import { mapState } from 'vuex';
import Web3 from 'web3';

export type GasMode = 'high' | 'low' | 'normal' | 'custom' | 'treasury';
export type GasModeData = {
  mode: GasMode;
  price: string;
  estTime: number;
};

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
  props: {
    avaialbleGasModes: {
      type: Array as PropType<Array<GasMode>>,
      required: true
    },
    txnGasLimit: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      selectedGasModeIndex: 0,
      isLoading: false
    };
  },
  computed: {
    ...mapState('account', ['gasPrices', 'ethPrice']),
    selectedGasMode(): GasMode {
      return this.avaialbleGasModes[this.selectedGasModeIndex];
    },
    selectedGasData(): GasModeData | undefined {
      if (this.gasPrices === undefined) {
        return undefined;
      }
      switch (this.selectedGasMode) {
        case 'low':
          return {
            mode: 'low',
            price: this.gasPrices.SafeGas.price,
            estTime: this.gasPrices.SafeGas.estTime
          };
        case 'normal':
          return {
            mode: 'normal',
            price: this.gasPrices.ProposeGas.price,
            estTime: this.gasPrices.ProposeGas.estTime
          };
        case 'high':
          return {
            mode: 'high',
            price: this.gasPrices.FastGas.price,
            estTime: this.gasPrices.FastGas.estTime
          };
        case 'treasury':
          return {
            mode: 'treasury',
            price: this.gasPrices.FastGas.price,
            estTime: this.gasPrices.FastGas.estTime
          };
      }
      return undefined;
    },
    nativeCurrencySymbol(): string {
      return '$';
    },
    gasPriceInGwei(): string {
      if (this.selectedGasData === undefined) {
        return 'No data';
      }

      return `${this.selectedGasData.price} Gwei`;
    },
    networkFee(): string {
      if (
        this.selectedGasData === undefined ||
        this.txnGasLimit === undefined ||
        this.ethPrice === undefined
      ) {
        return 'No data';
      }

      const selectedGasPriceInWEI = Web3.utils.toWei(
        this.selectedGasData.price,
        'Gwei'
      );

      const txnPriceInWEI = multiply(selectedGasPriceInWEI, this.txnGasLimit);
      const txnPriceInEth = Web3.utils.fromWei(txnPriceInWEI, 'ether');
      const txnPriceNative = multiply(txnPriceInEth, this.ethPrice);

      return `${this.nativeCurrencySymbol}${txnPriceNative}`;
    },
    estimatedTimeValue(): string {
      if (this.selectedGasData === undefined) {
        return 'No data';
      }
      return String(this.selectedGasData.estTime);
    },
    estimatedTimeUnit(): string {
      return 'sec';
    },
    estimatedTimeSign(): string {
      return '~';
    }
  },
  methods: {
    toggleGasPrice() {
      this.selectedGasModeIndex =
        (this.selectedGasModeIndex + 1) % this.avaialbleGasModes.length;
      this.$nextTick(() => {
        if (this.selectedGasData !== undefined) {
          this.$emit('selected-gas-changed', this.selectedGasData);
        }
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

    .indicators {
      display: flex;
      flex-flow: row nowrap;
      flex: 0 0 100%;
      justify-content: center;
      align-items: center;

      .option {
        line-height: 0.5rem;
        padding: 0.25rem;
        background-color: #b1b1b1;
        border-radius: 0.25rem;
        display: inline-block;
        margin-right: 0.25rem;
        transition: padding 0.5s ease, background-color 0.5s ease;

        &:last-child {
          margin-right: 0;
        }

        &.active {
          background-color: #2c3e50;
          padding: 0.25rem 0.75rem;
        }
      }
    }
  }
}
</style>
