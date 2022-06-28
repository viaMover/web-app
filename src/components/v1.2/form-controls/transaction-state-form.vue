<template>
  <div class="transaction-state-form">
    <div v-if="isReachedFinalStep" class="container final">
      <template v-if="isFailed">
        <h1>{{ $t('failed') }}</h1>
        <p>{{ $t('yourTransactionHasFailed') }}</p>
        <p>{{ $t('noWorries') }}</p>
        <div class="links">
          <a
            v-if="intercomAvailable"
            class="link"
            href="#"
            @click.prevent="openIntercom"
          >
            {{ $t('reachToSupport') }}
          </a>
          <a
            v-if="explorerLink"
            class="link"
            :href="explorerLink"
            rel="external help nofollow"
            target="_blank"
          >
            {{ $t('openExplorer') }}
          </a>
        </div>
      </template>
      <template v-else>
        <h1>{{ $t('success') }}</h1>

        <slot></slot>

        <div class="links">
          <a
            v-if="twitterLink"
            class="link"
            :href="twitterLink"
            rel="external nofollow"
            target="_blank"
          >
            {{ $t('flexOnTwitter') }}
          </a>
          <a
            v-if="explorerLink"
            class="link"
            :href="explorerLink"
            rel="external help nofollow"
            target="_blank"
          >
            {{ $t('openExplorer') }}
          </a>
        </div>
      </template>
    </div>
    <div v-else class="container progress">
      <secondary-page-header :description="description" :title="title" />
      <ul class="progressbar">
        <template v-for="(step, idx) in visibleScenario">
          <li
            :key="'st' + idx"
            :class="{
              active:
                step.index <= activeScenarioStepIndex ||
                (step.type === TransactionState.AwaitingForInput &&
                  step.index === activeScenarioStepIndex + 1)
            }"
          >
            <div class="step">
              <token-image
                :address="step.token.address"
                class="no-margin item-coin"
                hide-shadow
                :network="step.network"
                :src="step.token.logo"
                :symbol="step.token.symbol"
              />
              <p class="description">
                {{
                  $t(`${step.type}ShortDescription`, {
                    symbol: step.token.symbol
                  })
                }}
              </p>
            </div>
          </li>
          <form-progress-bar
            :key="'pb' + idx"
            :max-value="latestBlockTime"
            :value="getProgressValue(step)"
          />
        </template>
        <li>
          <div class="step">
            <token-image
              v-if="endState.picture === undefined"
              :address="step.token.address"
              class="no-margin item-coin"
              hide-shadow
              :network="step.network"
              :src="step.token.logo"
              :symbol="step.token.symbol"
            />
            <custom-picture v-else v-bind="endState.picture" />
          </div>
        </li>
      </ul>
      <div class="step-description">
        {{ stepDetailedDescription }} {{ elapsedTimeText }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapState } from 'vuex';

import dayjs from 'dayjs';
import Web3 from 'web3';

import {
  isIntercomEnabled,
  toggleIntercomVisibility
} from '@/router/intercom-utils';
import { isOnChainTransaction } from '@/services/v2/on-chain';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';
import {
  TransactionScenario,
  TransactionState,
  TransactionStateEventBus
} from '@/services/v2/utils/transaction-state-event-bus';
import { DisplayableTransactionScenarioState } from '@/services/v2/utils/transaction-state-event-bus/types';
import { sameAddress } from '@/utils/address';
import { getNetwork } from '@/utils/networkTypes';
import { Token, TokenWithBalance } from '@/wallet/types';

import CustomPicture from '@/components/html5/custom-picture.vue';
import { isPictureDescriptor } from '@/components/html5/types';
import TokenImage from '@/components/tokens/token-image.vue';
import FormProgressBar from '@/components/v1.2/form-controls/form-progress-bar.vue';
import SecondaryPageHeader from '@/components/v1.2/layout/secondary-page-header.vue';

export default Vue.extend({
  name: 'TransactionStateForm',
  components: {
    FormProgressBar,
    SecondaryPageHeader,
    CustomPicture,
    TokenImage
  },
  props: {
    eventBus: {
      type: Object as PropType<TransactionStateEventBus>,
      required: true
    },
    scenario: {
      type: Array as PropType<TransactionScenario>,
      required: true
    }
  },
  data() {
    return {
      activeScenarioStepIndex: 0,
      latestBlockTime: -1,
      now: dayjs(),
      started: dayjs(),
      nowUpdateHandler: undefined as number | undefined,
      estimatedRemainingTimeThreshold: 5,
      lastActiveStepReceived: undefined as dayjs.Dayjs | undefined,
      finalStateHash: undefined as string | undefined,
      TransactionState
    };
  },
  computed: {
    ...mapState('account', ['provider', 'allTokens', 'tokens']),
    transactionsCount(): number {
      return this.scenario.filter(
        (step) =>
          ![
            TransactionState.AwaitingForInput,
            TransactionState.Confirmed,
            TransactionState.Rejected
          ].includes(step.type)
      ).length;
    },
    estimatedRemainingTime(): dayjs.Dayjs {
      const cumulativeTransactionTime =
        this.transactionsCount * this.latestBlockTime;
      return dayjs().add(cumulativeTransactionTime, 'seconds');
    },
    title(): string {
      if (this.activeScenarioStepIndex === 0) {
        return this.$t('yourTransactionIsProcessing') as string;
      }

      const difference = dayjs.duration(
        this.estimatedRemainingTime.diff(this.now, 'seconds', false),
        'seconds'
      );

      if (difference.asSeconds() < this.estimatedRemainingTimeThreshold) {
        return this.$t('littleBitMore') as string;
      }

      return difference.humanize(false); // fixme: use proper display
    },
    description(): string {
      if (this.activeScenarioStepIndex === 0) {
        return this.$t('trackTheProgressOfYourTransactionHere') as string;
      }

      return this.$t('totalRemainingTime') as string;
    },
    elapsedTimeText(): string {
      const difference = dayjs.duration(
        this.now.diff(this.started, 'seconds', false),
        'seconds'
      );

      return difference.humanize(false); // fixme: use proper display
    },
    stepDetailedDescription(): string {
      const activeStep = this.displayableScenario[this.activeScenarioStepIndex];
      if (activeStep.type === TransactionState.AwaitingForInput) {
        const transactionApprovalsBefore = this.displayableScenario
          .slice(0, this.activeScenarioStepIndex)
          .filter(
            (step) => step.type === TransactionState.AwaitingForInput
          ).length;
        return this.$tc(
          'confirmTransactionInYourWallet',
          this.transactionsCount,
          {
            index: transactionApprovalsBefore + 1,
            total: this.transactionsCount
          }
        ) as string;
      }

      return this.$t(`${activeStep.type}LongDescription`, {
        symbol: activeStep.token.symbol
      }) as string;
    },
    web3(): Web3 {
      return this.provider.web3;
    },
    displayableScenario(): Array<DisplayableTransactionScenarioState> {
      return this.scenario.map((step, index) => {
        const temp: DisplayableTransactionScenarioState = {
          index: index,
          type: step.type,
          network: step.network,
          picture: step.picture,
          token: {
            name: '',
            address: step.tokenAddress ?? '',
            decimals: 0,
            logo: '',
            symbol: '',
            balance: '0',
            priceUSD: '0',
            marketCap: 0
          }
        };

        if (step.tokenAddress === undefined) {
          return temp;
        }

        // fixme: wait for multichain PR and then fix. Add network lookup as well
        const tokenFromWallet = this.tokens.find((t: TokenWithBalance) =>
          sameAddress(t.address, step.tokenAddress)
        );
        if (tokenFromWallet !== undefined) {
          temp.token = tokenFromWallet;
          return temp;
        }

        const tokenFromList = this.allTokens.find((t: Token) =>
          sameAddress(t.address, step.tokenAddress)
        );
        if (tokenFromList !== undefined) {
          temp.token = tokenFromList;
          return temp;
        }

        return temp;
      });
    },
    endState(): DisplayableTransactionScenarioState {
      return this.displayableScenario[this.displayableScenario.length - 1];
    },
    visibleScenario(): Array<DisplayableTransactionScenarioState> {
      return this.displayableScenario.filter(
        (step) =>
          step.type !== TransactionState.AwaitingForInput &&
          step.type !== TransactionState.Confirmed
      );
    },
    currentTransactionProgress(): number {
      if (this.lastActiveStepReceived === undefined) {
        return 0;
      }

      const diff = this.now.diff(this.lastActiveStepReceived, 'seconds', false);
      if (diff > this.latestBlockTime) {
        return this.latestBlockTime;
      }

      return diff;
    },
    isReachedFinalStep(): boolean {
      return [TransactionState.Confirmed, TransactionState.Rejected].includes(
        this.displayableScenario[this.activeScenarioStepIndex].type
      );
    },
    isFailed(): boolean {
      return (
        this.displayableScenario[this.activeScenarioStepIndex].type ===
        TransactionState.Rejected
      );
    },
    intercomAvailable(): boolean {
      return isIntercomEnabled;
    },
    explorerLink(): string | undefined {
      const networkInfo = getNetwork(this.currentNetwork);
      if (networkInfo === undefined) {
        return undefined;
      }

      if (this.finalStateHash === undefined) {
        return undefined;
      }

      return `${networkInfo.explorer}/${this.finalStateHash}`;
    },
    twitterLink(): string | undefined {
      if (this.finalStateHash === undefined) {
        return undefined;
      }

      const template = this.$t('twitterFlexText', {
        explorerLink: this.explorerLink,
        action: this.$t(
          `${
            this.displayableScenario[this.displayableScenario.length - 1].type
          }ActionName`
        ) // fixme: use pre-end-state
      }) as string;
      const encoded = encodeURIComponent(template);
      return `https://twitter.com/home?status=${encoded}`;
    }
  },
  mounted() {
    this.$watch(
      () => this.eventBus,
      async (eb) => {
        this.activeScenarioStepIndex = 0;
        this.finalStateHash = undefined;
        this.latestBlockTime = await this.getBlockTime();
        eb.onAny((type, params) => {
          addSentryBreadcrumb({
            type: 'debug',
            category: 'eventbus-handler.transaction-state-form.component.ui',
            message: 'Received an event',
            data: {
              type,
              params
            }
          });

          const firstSimilarStepAfterCurrentIndex =
            this.displayableScenario.findIndex(
              (step, index) =>
                step.type === type && index >= this.activeScenarioStepIndex
            );
          if (firstSimilarStepAfterCurrentIndex > 0) {
            this.activeScenarioStepIndex = firstSimilarStepAfterCurrentIndex;
          } else {
            addSentryBreadcrumb({
              type: 'error',
              category: 'eventbus-handler.transaction-state-form.component.ui',
              message: 'Failed to update active index',
              data: {
                event: {
                  type,
                  params
                },
                scenario: this.displayableScenario,
                activeIndex: this.activeScenarioStepIndex
              }
            });
          }

          this.setLastActiveStepReceivedIfNeeded(type);
        });
        eb.on(TransactionState.Confirmed, (payload) => {
          if (isOnChainTransaction(payload)) {
            this.finalStateHash = payload.transactionHash;
          } else if (payload.txID !== undefined) {
            this.finalStateHash = payload.txID;
          }
        });
        eb.on(TransactionState.Rejected, (payload) => {
          this.finalStateHash = payload.hash;
          captureSentryException(payload.error);
        });
      },
      {
        immediate: true
      }
    );
    this.nowUpdateHandler = window.setInterval(() => {
      this.now = dayjs();
    }, 1000);
  },
  beforeDestroy() {
    window.clearInterval(this.nowUpdateHandler);
  },
  methods: {
    isPictureDescriptor,
    async getBlockTime(): Promise<number> {
      try {
        const latestBlock = await this.web3.eth.getBlock('latest', false);
        // use only mined blocks, not pending
        if (latestBlock.number !== null) {
          const previousBlock = await this.web3.eth.getBlock(
            latestBlock.parentHash,
            false
          );
          return dayjs
            .unix(+latestBlock.timestamp)
            .diff(dayjs.unix(+previousBlock.timestamp), 'second');
        } else {
          return -1;
        }
      } catch (error) {
        addSentryBreadcrumb({
          type: 'debug',
          category: 'getBlockTime.transaction-state-form.component.ui',
          message: 'Failed to get latest block time',
          data: {
            error
          }
        });
        return -1;
      }
    },
    getProgressValue(step: DisplayableTransactionScenarioState): number {
      if (step.index < this.activeScenarioStepIndex) {
        return this.latestBlockTime;
      } else if (step.index === this.activeScenarioStepIndex) {
        return this.currentTransactionProgress;
      } else {
        return 0;
      }
    },
    setLastActiveStepReceivedIfNeeded(type: TransactionState): void {
      if (
        ![
          TransactionState.AwaitingForInput,
          TransactionState.Confirmed,
          TransactionState.Rejected
        ].includes(type)
      ) {
        this.lastActiveStepReceived = dayjs();
      }
    },
    openIntercom(): void {
      toggleIntercomVisibility(true);
    }
  }
});
</script>

<style scoped lang="less">
.container {
  width: 100%;
}

.progressbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  column-gap: 16px;
  row-gap: 32px;
  margin-bottom: 80px;
}

.form-progress-bar {
  flex: 1 1 auto;
}

.progressbar li {
  list-style-type: none;
  flex: 0 0 auto;

  .step {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    position: relative;

    &.active {
      background: red;
    }

    .icon {
      position: relative;

      &::after {
        content: '▲';
        font-size: 5px;
        line-height: 5px;
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
      }
    }

    .description {
      position: absolute;
      bottom: -64px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      word-break: normal;
      max-width: 100px;
    }
  }
}
</style>
