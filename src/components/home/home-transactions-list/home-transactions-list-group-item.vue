<template>
  <a
    class="item button-like"
    :href="txHref"
    rel="external nofollow"
    target="_blank"
  >
    <picture v-if="isLoading" class="icon token-icon">
      <img
        :alt="$t('icon.txtPendingIconAlt')"
        src="@/assets/images/ios-spinner.svg"
      />
    </picture>
    <token-image
      v-else
      :address="tokenAddress"
      :network="transaction.network"
      :src="tokenImageSrc"
      :symbol="tokenSymbol"
    />
    <div class="description">
      <h3 class="title">{{ head }}</h3>
      <div class="value">{{ subhead }}</div>
    </div>
    <div class="outcome">{{ balanceChange }}</div>
  </a>
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
  name: 'HomeTransactionsListGroupItem',
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
      const moverTransactionHeader = getTransactionHumanType(
        this.transaction,
        this.networkInfo.network
      );

      if (
        this.$te(`transactionTypes.${moverTransactionHeader.toLowerCase()}`)
      ) {
        return this.$t(
          `transactionTypes.${moverTransactionHeader.toLowerCase()}`
        ) as string;
      }

      return moverTransactionHeader;
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
    },
    txHref(): string {
      return `https://etherscan.io/tx/${this.transaction.hash}`;
    }
  }
});
</script>
