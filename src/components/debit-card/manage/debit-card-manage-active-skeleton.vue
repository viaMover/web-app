<template>
  <secondary-page :title="$t('debitCard.lblBeautifulCard')">
    <p class="description">{{ $t('debitCard.txtVisaDebitCard') }}</p>

    <div class="content">
      <div class="container card-image">
        <!-- todo replace with component -->
        <pu-skeleton tag="img" />
      </div>
      <statement-list class="container">
        <!--
          todo replace with component after
          statement-list-item becomes
          unified with other components
         -->
        <li v-for="idx in 4" :key="idx" class="item">
          <pu-skeleton :class="descriptionClass" tag="h3" width="190px" />
          <pu-skeleton :class="valueClass" tag="span" width="90px" />
        </li>
      </statement-list>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { StatementList } from '@/components/statements/statement-list';

export default Vue.extend({
  name: 'DebitCardManageActiveSkeleton',
  components: {
    StatementList
  }
});
</script>
