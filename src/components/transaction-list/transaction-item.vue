<template>
  <div class="general-desktop__sidebar-wrapper-info-item">
    <div class="label transaction-label" @click="onClick">
      <div v-if="isLoading" class="loader-icon">
        <img
          :alt="$t('icon.txtPendingIconAlt')"
          src="@/assets/images/ios-spinner.svg"
        />
      </div>
      <token-image
        v-else
        :address="tokenAddress"
        :src="tokenImageSrc"
        :symbol="tokenSymbol"
      />
      <div class="label-info">
        <p>{{ head }}</p>
        <span>{{ subhead }}</span>
      </div>
    </div>
    <div class="volume">
      <span>{{ balanceChange }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapState } from 'vuex';

import { getTransactionHumanType } from '@/services/mover/transactions/mapper';
import { fromWei, multiply } from '@/utils/bigmath';
import {
  formatToDecimals,
  formatToNative,
  getSignIfNeeded
} from '@/utils/format';
import { Transaction, TransactionTypes } from '@/wallet/types';

import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'TransactionItem',
  components: {
    TokenImage
  },
  props: {
    transaction: {
      type: Object as PropType<Transaction>,
      required: true
    }
  },
  computed: {
    ...mapState('account', ['networkInfo']),

    head(): string {
      return getTransactionHumanType(
        this.transaction,
        this.networkInfo.network
      );
    },
    subhead(): string {
      if (
        this.transaction.type === TransactionTypes.transferERC20 ||
        this.transaction.type === TransactionTypes.swapERC20
      ) {
        const change = fromWei(
          this.transaction.asset.change,
          this.transaction.asset.decimals
        );
        return `${formatToDecimals(change, 4)} ${
          this.transaction.asset.symbol
        }`;
      }
      if (this.transaction.type === TransactionTypes.approvalERC20) {
        return this.transaction.asset.symbol;
      }
      return 'Unknown';
    },
    balanceChange(): string {
      if (
        this.transaction.type === TransactionTypes.transferERC20 ||
        this.transaction.type === TransactionTypes.swapERC20
      ) {
        const change = fromWei(
          this.transaction.asset.change,
          this.transaction.asset.decimals
        );

        const changeNative = multiply(change, this.transaction.asset.price);
        let sign = '+';
        if (this.transaction.asset.direction === 'out') {
          sign = '-';
        }
        if (this.transaction.asset.direction === 'self') {
          return `$0.00`;
        }
        console.log('1312312', changeNative);
        return `${getSignIfNeeded(changeNative, sign)}$${formatToNative(
          changeNative
        )}`;
      }
      if (this.transaction.type === TransactionTypes.approvalERC20) {
        return '$0.00';
      }
      return '';
    },
    tokenAddress(): string {
      if (
        this.transaction.type === TransactionTypes.swapERC20 ||
        this.transaction.type === TransactionTypes.transferERC20 ||
        this.transaction.type === TransactionTypes.approvalERC20
      ) {
        return this.transaction.asset.address;
      }
      return '';
    },
    tokenSymbol(): string {
      if (
        this.transaction.type === TransactionTypes.swapERC20 ||
        this.transaction.type === TransactionTypes.transferERC20 ||
        this.transaction.type === TransactionTypes.approvalERC20
      ) {
        return this.transaction.asset.symbol;
      }
      return '';
    },
    isLoading(): boolean {
      return this.transaction.status === 'pending';
    },
    tokenImageSrc(): string {
      if (this.transaction.status === 'pending') {
        return 'LOADING';
      }
      if (
        this.transaction.type === TransactionTypes.swapERC20 ||
        this.transaction.type === TransactionTypes.transferERC20 ||
        this.transaction.type === TransactionTypes.approvalERC20
      ) {
        return this.transaction.asset.iconURL;
      }
      return '';
    },
    isLPToken(): boolean {
      return false;
    }
  },
  methods: {
    onClick(): void {
      window.open(`https://etherscan.io/tx/${this.transaction.hash}`, '_blank');
    }
  }
});
</script>
