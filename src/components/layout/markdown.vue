<template>
  <div class="markdown-body break-words" v-html="markdown" />
</template>

<script lang="ts">
import Vue from 'vue';

import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';

// import '@/styles/_markdown.less';

export default Vue.extend({
  name: 'Markdown',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      remarkableInstance: undefined as Remarkable | undefined
    };
  },
  computed: {
    markdown(): string {
      if (this.remarkableInstance === undefined) {
        return '';
      }

      return this.remarkableInstance.render(this.text);
    }
  },
  mounted() {
    this.remarkableInstance = new Remarkable({
      html: false,
      breaks: true,
      typographer: false
    }).use(linkify);
  }
});
</script>
