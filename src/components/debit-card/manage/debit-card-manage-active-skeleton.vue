<template>
  <secondary-page class="manage skeleton" hide-info>
    <template v-slot:title>
      <secondary-page-header
        :description="$t('debitCard.txtVisaDebitCard')"
        :title="$t('debitCard.lblBeautifulCard')"
      />
    </template>

    <div class="content">
      <div class="container">
        <pu-skeleton class="card-image skeleton" tag="div" />
      </div>

      <analytics-list class="container">
        <li v-for="idx in 4" :key="idx" class="item">
          <pu-skeleton tag="h3" width="190px" />
          <pu-skeleton tag="span" width="90px" />
        </li>
      </analytics-list>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { AnalyticsList } from '@/components/analytics-list';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

export default Vue.extend({
  name: 'DebitCardManageActiveSkeleton',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    AnalyticsList
  }
});
</script>
