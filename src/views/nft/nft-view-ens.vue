<template>
  <content-wrapper-two-sided
    class="shop nft-drops view ens"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ nft.name }}</h1>
        <div v-if="nft.meta.description" class="description">
          {{ nft.meta.description }}
        </div>
      </div>

      <analytics-list>
        <analytics-list-item
          v-if="nft.meta.url"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblViewOnEns')"
        >
          <template>
            <a
              class="link emphasize bold"
              :href="nft.meta.url"
              rel="external help nofollow"
              target="_blank"
            >
              {{ nft.meta.url }}
            </a>
          </template>
        </analytics-list-item>
      </analytics-list>

      <analytics-list
        v-if="nft.meta.attributes"
        :title="$t('NFTs.lblNFTAttributes')"
      >
        <analytics-list-item
          v-for="(attribute, idx) in nft.meta.attributes"
          :key="idx"
          :description="formatAttribute(attribute)"
          :is-loading="isStoreLoading"
          :title="attribute.trait_type ? attribute.trait_type : attribute.value"
        />
      </analytics-list>
    </template>

    <template v-slot:right>
      <custom-picture :src="nft.picture.src" />
    </template>
  </content-wrapper-two-sided>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import dayjs from 'dayjs';

import { Attribute } from '@/services/v2/api/ens';
import { formatPercents, formatToNative } from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import CustomPicture from '@/components/html5/custom-picture.vue';
import { ContentWrapperTwoSided } from '@/components/layout';

export default Vue.extend({
  name: 'NftViewEns',
  components: {
    CustomPicture,
    ContentWrapperTwoSided,
    AnalyticsList,
    AnalyticsListItem
  },
  computed: {
    ...mapState('nft', {
      nft: 'ens',
      isStoreLoading: 'isLoading'
    })
  },
  methods: {
    ...mapActions('nft', {
      claimUnexpectedMove: 'claimUnexpectedMove',
      refreshNftStats: 'fetchUnexpectedMoveData',
      claimAndExchangeUnexpectedMove: 'claimAndExchangeUnexpectedMove',
      exchangeUnexpectedMove: 'exchangeUnexpectedMove'
    }),
    handleClose(): void {
      this.$router.back();
    },
    formatAttribute(attribute: Attribute): string | number {
      if ('display_type' in attribute) {
        switch (attribute.display_type) {
          case 'date': {
            const d = dayjs(attribute.value);
            if (d.isValid()) {
              return d.format('YYYY/MM/DD, HH:mm UTC');
            }

            return dayjs.unix(+attribute.value).format('YYYY/MM/DD, HH:mm UTC');
          }
          case 'boost_number':
            return formatToNative(attribute.value);
          case 'boost_percentage':
            return `${formatPercents(attribute.value)}%`;
          case 'number':
          default:
            return attribute.value;
        }
      }

      return attribute.value;
    }
  }
});
</script>
