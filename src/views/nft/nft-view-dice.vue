<template>
  <div>
    <shop-wrapper has-close-button @close="handleClose">
      <template v-slot:info>
        <h1 class="info__title">{{ $t('NFTs.lblDiceProject') }}</h1>
        <p class="info__description">
          {{ $t('NFTs.txtNFTs.dice.pageDescriptionPartOne') }}
          <br /><br />
          <i18n path="NFTs.txtNFTs.dice.pageDescriptionPartTwo">
            <a href="https://diceproject.org" target="_blank">
              <b>{{ $t('NFTs.lblDiceProject') }}</b>
            </a>
          </i18n>
        </p>
        <shop-list>
          <shop-list-item
            :title="$t('NFTs.lblTotalClaimed')"
            :value="totalClaimed"
          />
        </shop-list>
        <action-button
          button-class="button button-active"
          :text="$t('NFTs.btn.dice.get.txt')"
          @button-click="handleClaim(20)"
        />
        <div v-if="getNftError !== undefined" class="error-message">
          {{ getNftError }}
        </div>
        <div class="info__more">
          <p>{{ $t('NFTs.lblOtherDiceOptions') }}</p>
          <ul>
            <li>
              <emoji-text-button
                button-class="button-active"
                :emoji="$t('NFTs.btn.dice.fourSide.emoji')"
                :text="$t('NFTs.btn.dice.fourSide.txt')"
                @button-click="handleClaim(4)"
              />
            </li>
            <li>
              <emoji-text-button
                button-class="button-active"
                :emoji="$t('NFTs.btn.dice.sixSide.emoji')"
                :text="$t('NFTs.btn.dice.sixSide.txt')"
                @button-click="handleClaim(6)"
              />
            </li>
            <li>
              <emoji-text-button
                button-class="button-active"
                :emoji="$t('NFTs.btn.dice.doubleSixSide.emoji')"
                :text="$t('NFTs.btn.dice.doubleSixSide.txt')"
                @button-click="handleClaim(66)"
              />
            </li>
            <li>
              <emoji-text-button
                button-class="button-active"
                :emoji="$t('NFTs.btn.dice.eightSide.emoji')"
                :text="$t('NFTs.btn.dice.eightSide.txt')"
                @button-click="handleClaim(8)"
              />
            </li>
            <li>
              <emoji-text-button
                button-class="button-active"
                :emoji="$t('NFTs.btn.dice.tenSide.emoji')"
                :text="$t('NFTs.btn.dice.tenSide.txt')"
                @button-click="handleClaim(10)"
              />
            </li>
            <li>
              <emoji-text-button
                button-class="button-active"
                :emoji="$t('NFTs.btn.dice.twelveSide.emoji')"
                :text="$t('NFTs.btn.dice.twelveSide.txt')"
                @button-click="handleClaim(12)"
              />
            </li>
            <li>
              <div v-if="actionError !== undefined" class="error-message">
                {{ actionError }}
              </div>
            </li>
          </ul>
        </div>
      </template>
      <template v-slot:illustration>
        <!--TODO replace src with prod-->
        <iframe
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen=""
          height="100%"
          sandbox="allow-scripts"
          src="https://gateway.pinata.cloud/ipfs/QmXaBGUrnH6PKkCFBQyon26zN4J6qVHAVY3qyVA4wLosdx"
          width="100%"
        />
      </template>
    </shop-wrapper>
    <simple-loader-modal
      v-if="transactionStep !== undefined"
      :loader-step="transactionStep"
      @close="transactionStep = undefined"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { Step } from '@/components/controls/form-loader';
import { ChangePayload, DicePayload } from '@/store/modules/nft/actions/claim';

import { ShopWrapper, ShopList, ShopListItem } from '@/components/layout';
import ActionButton from '@/components/buttons/action-button.vue';
import EmojiTextButton from '@/components/buttons/emoji-text-button.vue';
import SimpleLoaderModal from '@/components/modals/simple-loader-modal.vue';
import { DiceType } from '@/services/chain';

export default Vue.extend({
  name: 'NftViewDice',
  components: {
    EmojiTextButton,
    ActionButton,
    ShopList,
    ShopListItem,
    ShopWrapper,
    SimpleLoaderModal
  },
  data() {
    return {
      transactionStep: undefined as Step | undefined,
      getNftError: undefined as string | undefined,
      actionError: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('nft', {
      totalClaimed: 'DiceTotalClaimed'
    }),
    ...mapState('account', {
      currentAddress: 'currentAddress'
    })
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.getNftError = undefined;
    this.actionError = undefined;
  },
  methods: {
    ...mapActions('nft', ['claimDice', 'refreshNftStats']),
    handleClose(): void {
      this.$router.back();
    },
    async handleClaim(type: DiceType): Promise<void> {
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
      }
    }
  }
});
</script>
