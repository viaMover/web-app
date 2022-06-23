<template>
  <div class="transaction-state-form">
    <ul>
      <li>
        <custom-picture
          v-if="isStartStatePictureDescriptor"
          :alt="startStatePicture.alt"
          :network="startNetwork"
          :sources="startStatePicture.sources"
          :src="startStatePicture.src"
          :webp-sources="startStatePicture.webpSources"
        />
        <token-image
          v-else
          :address="startStatePicture.address"
          class="no-margin item-coin"
          hide-shadow
          :network="startNetwork"
          :src="startStatePicture.logo"
          :symbol="startStatePicture.symbol"
        />
      </li>
      <li v-for="(step, idx) in scenario" :key="idx">
        <strong>step {{ idx }} of {{ transactionsCount }}</strong>
        {{ step.type }}
        :
        {{ step.tokenAddress }}
        @
        {{ step.network }}
      </li>
      <li>
        <custom-picture
          v-if="isEndStatePictureDescriptor"
          :alt="endStatePicture.alt"
          :network="endNetwork"
          :sources="endStatePicture.sources"
          :src="endStatePicture.src"
          :webp-sources="endStatePicture.webpSources"
        />
        <token-image
          v-else
          :address="endStatePicture.address"
          class="no-margin item-coin"
          hide-shadow
          :network="endNetwork"
          :src="endStatePicture.logo"
          :symbol="endStatePicture.symbol"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import {
  ListenerParams,
  TransactionScenario,
  TransactionState,
  TransactionStateEventBus
} from '@/services/v2/utils/transaction-state-event-bus';
import { Network } from '@/utils/networkTypes';
import { Token } from '@/wallet/types';

import { PictureDescriptor } from '@/components/html5';
import { isPictureDescriptor } from '@/components/html5/types';

export default Vue.extend({
  name: 'TransactionStateForm',
  props: {
    startStatePicture: {
      type: Object as PropType<Token | PictureDescriptor>,
      required: true
    },
    startNetwork: {
      type: String as PropType<Network>,
      required: true
    },
    endStatePicture: {
      type: Object as PropType<Token | PictureDescriptor>,
      required: true
    },
    eventBus: {
      type: Object as PropType<TransactionStateEventBus>,
      required: true
    },
    scenario: {
      type: Array as PropType<TransactionScenario>,
      required: true
    },
    endNetwork: {
      type: String as PropType<Network>,
      required: true
    }
  },
  data() {
    return {
      currentState: TransactionState.Started as TransactionState,
      receivedEvents: []
    };
  },
  computed: {
    transactionsCount(): number {
      return this.scenario.length;
    }
  },
  mounted() {
    this.$watch(
      () => this.eventBus,
      (eb) => {
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
        });
      },
      {
        immediate: true
      }
    );
  },
  methods: {
    isStartStatePictureDescriptor(): boolean {
      return isPictureDescriptor(this.startStatePicture);
    },
    isEndStatePictureDescriptor(): boolean {
      return isPictureDescriptor(this.endStatePicture);
    },
    handleEvent<
      Type extends keyof ListenerParams,
      Params extends ListenerParams[Type]
    >(type: Type, params: Params): void {
      switch (type) {
        case TransactionState.Approve:
          // TODO: add handler
          break;
        case TransactionState.Swap:
          // TODO: add handler
          break;
        case TransactionState.Deposit:
          // TODO: add handler
          break;
        case TransactionState.Withdraw:
          // TODO: add handler
          break;
        case TransactionState.Bridge:
          // TODO: add handler
          break;
        case TransactionState.TopUp:
          // TODO: add handler
          break;
        case TransactionState.AwaitingForInput:
          // TODO: add handler
          break;
        case TransactionState.Rejected:
          // TODO: add handler
          break;
        case TransactionState.Confirmed:
          // TODO: add handler
          break;
      }
    }
  }
});
</script>
