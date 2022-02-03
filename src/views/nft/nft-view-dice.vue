<template>
  <content-wrapper-two-sided
    class="shop nft-drops view dice"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ $t('NFTs.lblDiceProject') }}</h1>
        <div class="description">
          {{ $t('NFTs.txtNFTs.dice.pageDescriptionPartOne') }}
          <br /><br />
          <i18n path="NFTs.txtNFTs.dice.pageDescriptionPartTwo">
            <a
              class="link"
              href="https://diceproject.org"
              rel="external help"
              target="_blank"
            >
              {{ $t('NFTs.lblDiceProject') }}
            </a>
          </i18n>
        </div>
      </div>

      <analytics-list>
        <analytics-list-item
          :description="totalClaimed"
          :title="$t('NFTs.lblTotalClaimed')"
        />
      </analytics-list>

      <div class="actions">
        <div class="group default">
          <action-button
            class="primary"
            :text="$t('NFTs.btn.dice.get.txt')"
            @button-click="handleClaim(20)"
          />
        </div>

        <div class="group">
          <h2 class="title">{{ $t('NFTs.lblOtherDiceOptions') }}</h2>
          <div class="items">
            <emoji-text-button
              class="item"
              :emoji="$t('NFTs.btn.dice.fourSide.emoji')"
              :text="$t('NFTs.btn.dice.fourSide.txt')"
              @button-click="handleClaim(4)"
            />
            <emoji-text-button
              class="item"
              :emoji="$t('NFTs.btn.dice.sixSide.emoji')"
              :text="$t('NFTs.btn.dice.sixSide.txt')"
              @button-click="handleClaim(6)"
            />
            <emoji-text-button
              class="item"
              :emoji="$t('NFTs.btn.dice.doubleSixSide.emoji')"
              :text="$t('NFTs.btn.dice.doubleSixSide.txt')"
              @button-click="handleClaim(66)"
            />
            <emoji-text-button
              class="item"
              :emoji="$t('NFTs.btn.dice.eightSide.emoji')"
              :text="$t('NFTs.btn.dice.eightSide.txt')"
              @button-click="handleClaim(8)"
            />
            <emoji-text-button
              class="item"
              :emoji="$t('NFTs.btn.dice.tenSide.emoji')"
              :text="$t('NFTs.btn.dice.tenSide.txt')"
              @button-click="handleClaim(10)"
            />
            <emoji-text-button
              class="item"
              :emoji="$t('NFTs.btn.dice.twelveSide.emoji')"
              :text="$t('NFTs.btn.dice.twelveSide.txt')"
              @button-click="handleClaim(12)"
            />
          </div>
        </div>

        <div v-if="actionError !== undefined" class="group error-message">
          {{ actionError }}
        </div>
      </div>
    </template>

    <template v-slot:right>
      <iframe
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen=""
        height="100%"
        sandbox="allow-scripts"
        :src="diceSrc"
        width="100%"
      />
    </template>

    <template v-slot:context-button>
      <context-button
        button-class="button round navigation"
        class="page-burger-button absolute"
        :popover-parent-id="popoverParentId"
      >
        <context-button-item @click="selectDice(4)">
          <emoji-text-button
            :emoji="$t('NFTs.btn.dice.fourSide.emoji')"
            :text="$t('NFTs.btn.dice.fourSide.txt')"
          />
        </context-button-item>
        <context-button-item @click="selectDice(6)">
          <emoji-text-button
            :emoji="$t('NFTs.btn.dice.sixSide.emoji')"
            :text="$t('NFTs.btn.dice.sixSide.txt')"
          />
        </context-button-item>
        <context-button-item @click="selectDice(66)">
          <emoji-text-button
            button-class="button-active"
            :emoji="$t('NFTs.btn.dice.doubleSixSide.emoji')"
            :text="$t('NFTs.btn.dice.doubleSixSide.txt')"
          />
        </context-button-item>
        <context-button-item @click="selectDice(8)">
          <emoji-text-button
            :emoji="$t('NFTs.btn.dice.eightSide.emoji')"
            :text="$t('NFTs.btn.dice.eightSide.txt')"
          />
        </context-button-item>
        <context-button-item @click="selectDice(10)">
          <emoji-text-button
            :emoji="$t('NFTs.btn.dice.tenSide.emoji')"
            :text="$t('NFTs.btn.dice.tenSide.txt')"
          />
        </context-button-item>
        <context-button-item @click="selectDice(12)">
          <emoji-text-button
            :emoji="$t('NFTs.btn.dice.twelveSide.emoji')"
            :text="$t('NFTs.btn.dice.twelveSide.txt')"
          />
        </context-button-item>
        <context-button-item @click="selectDice(20)">
          <emoji-text-button
            :emoji="$t('NFTs.btn.dice.twentySide.emoji')"
            :text="$t('NFTs.btn.dice.twentySide.txt')"
          />
        </context-button-item>
      </context-button>
    </template>

    <template v-slot:modals>
      <simple-loader-modal
        v-if="transactionStep !== undefined"
        :loader-step="transactionStep"
        @close="transactionStep = undefined"
      />
    </template>
  </content-wrapper-two-sided>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { DiceType } from '@/services/chain';
import { DicePayload } from '@/store/modules/nft/types';

import AnalyticsList from '@/components/analytics-list/analytics-list.vue';
import AnalyticsListItem from '@/components/analytics-list/analytics-list-item.vue';
import {
  ActionButton,
  ContextButton,
  ContextButtonItem,
  EmojiTextButton
} from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ContentWrapperTwoSided } from '@/components/layout';
import SimpleLoaderModal from '@/components/modals/simple-loader-modal.vue';

export default Vue.extend({
  name: 'NftViewDice',
  components: {
    AnalyticsListItem,
    AnalyticsList,
    ContentWrapperTwoSided,
    ContextButtonItem,
    ContextButton,
    EmojiTextButton,
    ActionButton,
    SimpleLoaderModal
  },
  data() {
    return {
      popoverParentId: 'dice-project-action-buttons',
      selectedDice: 20 as DiceType,
      transactionStep: undefined as Step | undefined,
      actionError: undefined as string | undefined,
      dices: [
        {
          side: 4,
          src: 'https://ipfs.io/ipfs/QmenWepTMkfkQ5CiDwzXFQEZPpZEGbK5QauGST4M1BzBFt'
        },
        {
          side: 6,
          src: 'https://ipfs.io/ipfs/QmRZNUU5YvYzDYbLNEhGVJQq8jSiVvRnBanMp2Hpf7uF16'
        },
        {
          side: 8,
          src: 'https://ipfs.io/ipfs/QmYKbKvKq3QKocnaPDXgWZVRvEh3BDrrYmjWpptogijpvb'
        },
        {
          side: 10,
          src: 'https://ipfs.io/ipfs/QmVZodBASchcpkoJsE24KGs3EfFSmUZdDnyUA8Dm2CRtSV'
        },
        {
          side: 12,
          src: 'https://ipfs.io/ipfs/QmfXFqmgJbh8QQnfrRS8Rkq8uc7py3Vvy6JBdxMuK4XajH'
        },
        {
          side: 20,
          src: 'https://ipfs.io/ipfs/QmPR8DkEp2dH3QpBfxjjCmo17JPT7EACFembSH6Smu5b6d'
        },
        {
          side: 66,
          src: 'https://ipfs.io/ipfs/QmPNgijfDeaXhCy3oTB7srELakLdNhHMQmZ2epBBZybEx6'
        }
      ]
    };
  },
  computed: {
    ...mapState('nft', {
      totalClaimed: 'DiceTotalClaimed'
    }),
    diceSrc(): string {
      return (
        this.dices.find((item) => item.side === this.selectedDice)?.src ?? ''
      );
    }
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.actionError = undefined;
  },
  methods: {
    ...mapActions('nft', ['claimDice', 'refreshNftStats']),
    handleClose(): void {
      this.$router.back();
    },
    selectDice(side: DiceType): void {
      console.debug('hellow', side);
      this.selectedDice = side;
    },
    async handleClaim(type: DiceType): Promise<void> {
      this.actionError = undefined;
      try {
        this.transactionStep = 'Confirm';
        await this.claimDice({
          diceType: type,
          changeStep: () => {
            this.transactionStep = 'Process';
          }
        } as DicePayload);
        await this.refreshNftStats();
        this.transactionStep = 'Success';
      } catch (err) {
        this.transactionStep = 'Reverted';
        this.actionError = this.$t('NFTs.txtOhNoSomething').toString();
      }
    }
  }
});
</script>
