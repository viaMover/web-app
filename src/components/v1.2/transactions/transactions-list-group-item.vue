<template>
  <a
    class="item button-like"
    :href="txHref"
    rel="external nofollow"
    target="_blank"
  >
    <picture v-if="isLoading" class="icon token-icon">
      <img alt="" :src="spinnerPicture.src" />
    </picture>
    <token-image
      v-else
      :address="tokenAddress"
      hide-shadow
      :src="tokenImageSrc"
      :symbol="tokenSymbol"
    />
    <div class="description">
      <h3 class="title">{{ head }}</h3>
      <div class="value">{{ subhead ? subhead : $t('unknown') }}</div>
    </div>
    <div class="outcome">{{ balanceChange }}</div>
  </a>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapState } from 'vuex';

import { getThemedPicture } from '@/assets/images/icons/spinner';
import { getTransactionHumanType } from '@/services/mover/transactions/mapper';
import { fromWei, multiply } from '@/utils/bigmath';
import { formatToDecimals } from '@/utils/format';
import { Transaction, TransactionTypes } from '@/wallet/types';

import { PictureDescriptor } from '@/components/html5';
import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'TransactionsListGroupItem',
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
    ...mapState(['theme']),
    ...mapState('account', ['networkInfo']),
    spinnerPicture(): PictureDescriptor {
      return getThemedPicture(this.theme);
    },
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
    subhead(): string | undefined {
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
      return undefined;
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
          return this.formatAsNativeCurrency(0);
        }
        return this.formatAsNativeCurrencyWithOptionalSign(changeNative, sign);
      }

      if (this.transaction.type === TransactionTypes.approvalERC20) {
        return this.formatAsNativeCurrency(0);
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
