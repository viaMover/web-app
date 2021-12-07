<template>
  <div id="app">
    <pu-skeleton-theme
      :color="colors ? colors['skeleton-color'] : 'var(--color-skeleton-color)'"
      :highlight="
        colors
          ? colors['skeleton-highlight-color']
          : 'var(--color-skeleton-highlight-color)'
      "
    >
      <div class="page">
        <web3-modal-vue
          ref="web3modal"
          cache-provider
          :provider-options="providerOptions"
          :theme="theme"
        />
        <transition appear name="fade">
          <preload v-if="showPreload" key="preload" class="dashboard" />
          <router-view v-else key="viewport" class="dashboard" />
        </transition>
        <div class="dashboard dashboard-mobile">
          <a
            class="logo button-active"
            href="https://viamover.com/"
            rel="external"
            target="_blank"
          >
            <img alt="logo" src="@/assets/images/logo.svg" />
          </a>
          <div class="page-content">
            <div class="dashboard-mobile__wrapper">
              <div class="dashboard-mobile__wrapper-gif">
                <video
                  autoplay="autoplay"
                  data-keepplaying="data-keepplaying"
                  loop="loop"
                  muted="muted"
                  playsinline="playsinline"
                  src="@/assets/videos/welcome.webm"
                ></video>
              </div>
              <h1>{{ $t('lblDashboardMobile') }}</h1>
              <p>{{ $t('txtDashboardMobile') }}</p>
              <a class="black-link button-active" href="https://viamover.com/">
                {{ $t('btnDashboardMobile') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </pu-skeleton-theme>
    <!-- <div class="page">
      <div class="dashboard">
        <aside v-if="isLeftRailTransactions" class="left-rail transactions">
          <div class="wrapper">
            <form class="form search" @submit.prevent="">
              <input
                class="search-term"
                placeholder="Enter the search term here"
                type="search"
              />
              <button class="icon" type="submit">🔍</button>
            </form>

            <div class="list">
              <section class="group">
                <h2 class="header"><time datetime="2021-11-25">Today</time></h2>
                <div class="items">
                  <div class="item">
                    <picture class="icon">
                      <img
                        :alt="$t('icon.txtPendingIconAlt')"
                        height="38px"
                        src="@/assets/images/ios-spinner.svg"
                        width="38px"
                      />
                    </picture>
                    <div class="description">
                      <div class="title">Deposit in Savings</div>
                      <data class="value" value="0.00">0.00 USDC</data>
                    </div>
                    <data class="outcome" value="0.00">$0.00</data>
                  </div>
                  <div class="item">
                    <div class="icon fallback">
                      <span>XMOVE</span>
                    </div>
                    <div class="description">
                      <div class="title">Withdraw from Treasury</div>
                      <div class="value">5.00 ETH</div>
                    </div>
                    <div class="outcome">-$25.000</div>
                  </div>
                </div>
              </section>
              <section class="group">
                <h2 class="header">Yesterday</h2>
                <div class="items">
                  <div class="item">
                    <picture class="icon">
                      <img src="@/assets/images/ETH.png" />
                    </picture>
                    <div class="description">
                      <h3 class="title">Deposit in Savings</h3>
                      <div class="value">0.00 USDC</div>
                    </div>
                    <div class="outcome">$0.00</div>
                  </div>
                  <div class="item">
                    <picture class="icon">
                      <img src="@/assets/images/ETH.png" />
                    </picture>
                    <div class="description">
                      <h3 class="title">Deposit in Savings</h3>
                      <div class="value">0.00 USDC</div>
                    </div>
                    <div class="outcome">$0.00</div>
                  </div>
                  <div class="item">
                    <picture class="icon">
                      <source srcset="@/assets/images/MOVE@2x.png 2x" />
                      <img
                        alt="MOVE asset icon"
                        height="19px"
                        src="@/assets/images/MOVE.png"
                        width="19px"
                      />
                    </picture>
                    <div class="description">
                      <h3 class="title">Withdraw from Treasury</h3>
                      <div class="value">11,984.4953 MOVE</div>
                    </div>
                    <div class="outcome">-$1100,071.11</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </aside>
        <nav v-else class="left-rail navigation">
          <div class="wrapper">
            <div class="list">
              <section class="group">
                <h2 class="header">My first navigation block</h2>
                <div class="items">
                  <a class="item picture active" href="#">
                    <picture class="icon">
                      <source
                        srcset="
                          @/assets/images/governance-global-analytics@2x.png 2x
                        "
                      />
                      <img
                        alt="Hellow"
                        src="@/assets/images/governance-global-analytics.png"
                      />
                    </picture>
                    <div class="info">
                      <h3 class="title">Go to my BeautifulCard</h3>
                      <div class="description">Hell yeah!</div>
                    </div>
                  </a>
                  <a class="item picture" href="#">
                    <picture class="icon">
                      <source
                        srcset="
                          @/assets/images/governance-global-analytics@2x.png 2x
                        "
                      />
                      <img
                        alt="Hellow"
                        src="@/assets/images/governance-global-analytics.png"
                      />
                    </picture>
                    <div class="info">
                      <h3 class="title muted medium">Well, this is nav item</h3>
                      <div class="description bold emphasize">
                        Let's see what's inside this navigation item really
                      </div>
                    </div>
                  </a>
                </div>
              </section>
              <section class="group">
                <h2 class="header">My second navigation block</h2>
                <div class="items">
                  <a class="item emoji" href="#">
                    <div class="icon">❤</div>
                    <h3 class="info">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Reprehenderit temporibus quidem aliquid nemo illum alias
                      cum vitae, doloribus quae! Nihil tenetur ad fuga voluptas
                      exercitationem optio quia quaerat ipsa necessitatibus!
                    </h3>
                  </a>
                  <a class="item emoji active" href="#">
                    <div class="icon">💛</div>
                    <h3 class="info">Hellow 2</h3>
                  </a>
                </div>
              </section>
              <section class="group">
                <h2 class="header">My second navigation block</h2>
                <div class="items">
                  <a class="item emoji" href="#">
                    <div class="icon">❤</div>
                    <h3 class="info">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Reprehenderit temporibus quidem aliquid nemo illum alias
                      cum vitae, doloribus quae! Nihil tenetur ad fuga voluptas
                      exercitationem optio quia quaerat ipsa necessitatibus!
                    </h3>
                  </a>
                  <a class="item emoji active" href="#">
                    <picture class="icon">
                      <source
                        srcset="
                          @/assets/images/governance-global-analytics@2x.png 2x
                        "
                      />
                      <img
                        alt="Hellow"
                        src="@/assets/images/governance-global-analytics.png"
                      />
                    </picture>
                    <h3 class="info">Hellow 2</h3>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </nav>
        <div class="page-content" data-page-element-id="main-content-root">
          <button
            class="button round navigation page-close-button"
            data-page-element-id="close-button"
          >
            &cross;
          </button>
          <button
            class="button round navigation page-back-button"
            data-page-element-id="back-button"
          >
            &leftarrow;
          </button>
          <div class="wrapper">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Platea
            dictumst quisque sagittis purus sit amet volutpat. Lacinia at quis
            risus sed vulputate odio ut enim blandit. Euismod quis viverra nibh
            cras. Tempus imperdiet nulla malesuada pellentesque. In vitae turpis
            massa sed elementum tempus. Neque egestas congue quisque egestas.
            Neque volutpat ac tincidunt vitae semper quis. Risus commodo viverra
            maecenas accumsan lacus vel facilisis volutpat est. Vitae congue eu
            consequat ac. Ullamcorper velit sed ullamcorper morbi. Odio sit amet
            massa vitae tortor condimentum. In ante metus dictum at. Tortor at
            auctor urna nunc. Duis ultricies lacus sed turpis tincidunt id
            aliquet risus. Phasellus vestibulum lorem sed risus ultricies
            tristique nulla aliquet. Neque egestas congue quisque quisque
            egestas diam in. Est placerat in egestas erat imperdiet sed euismod
            nisi. Facilisis mauris sit amet massa vitae tortor. Nullam ac tortor
            vitae purus faucibus ornare suspendisse sed. Mi sit amet mauris
            commodo quis imperdiet massa. Donec enim diam vulputate ut sit amet.
            Purus ut faucibus pulvinar elementum integer enim neque neque
            volutpat. Ipsum faucibus vitae aliquet nec ullamcorper sit.
            Porttitor rhoncus dolor purus non. Montes nascetur ridiculus mus
            mauris vitae ultricies. Enim facilisis gravida neque convallis a.
            Justo donec enim diam vulputate. Convallis convallis tellus id
            interdum velit laoreet id. Adipiscing elit pellentesque habitant
            morbi tristique. Ullamcorper morbi tincidunt ornare massa eget
            egestas purus viverra. Leo a diam sollicitudin tempor id eu nisl
            nunc. Dolor sed viverra ipsum nunc. Tortor dignissim convallis
            aenean et. Cras ornare arcu dui vivamus arcu. Id venenatis a
            condimentum vitae sapien. Urna nunc id cursus metus aliquam eleifend
            mi. Eu non diam phasellus vestibulum lorem sed risus ultricies.
            Ullamcorper a lacus vestibulum sed arcu. Nunc sed augue lacus
            viverra vitae congue eu consequat. Nulla porttitor massa id neque.
            Etiam dignissim diam quis enim lobortis. Ultrices vitae auctor eu
            augue ut lectus arcu. Morbi tristique senectus et netus et
            malesuada. Et ultrices neque ornare aenean euismod elementum. Quis
            varius quam quisque id diam vel quam elementum. A condimentum vitae
            sapien pellentesque. Diam quis enim lobortis scelerisque fermentum
            dui faucibus. Quam id leo in vitae turpis massa sed. Aliquet eget
            sit amet tellus cras. Arcu non sodales neque sodales ut etiam. Duis
            ut diam quam nulla porttitor massa id neque aliquam. Lacus laoreet
            non curabitur gravida. Sed faucibus turpis in eu mi bibendum neque
            egestas congue. Ornare quam viverra orci sagittis. Diam donec
            adipiscing tristique risus nec feugiat in fermentum posuere. Mauris
            Mauris a diam maecenas sed enim ut sem viverra aliquet. Nisi quis
            eleifend quam adipiscing. Vitae ultricies leo integer malesuada nunc
            vel commodo. Eget mauris pharetra et ultrices neque. Fermentum leo
            vel orci porta. Congue quisque egestas diam in. Donec et odio
            pellentesque diam volutpat commodo sed egestas egestas. Accumsan
            tortor posuere ac ut consequat semper viverra. Bibendum est
            ultricies integer quis auctor. Turpis in eu mi bibendum neque
            egestas congue. Etiam erat velit scelerisque in dictum non.
            Tristique senectus et netus et malesuada fames. Ultrices tincidunt
            arcu non sodales neque. Eget aliquet nibh praesent tristique magna
            sit amet purus gravida. Egestas fringilla phasellus faucibus
            scelerisque eleifend donec pretium. Magnis dis parturient montes
            nascetur ridiculus mus mauris. Commodo nulla facilisi nullam
            vehicula. Nam aliquam sem et tortor. Posuere ac ut consequat semper
            viverra nam libero justo. Elit scelerisque mauris pellentesque
            pulvinar pellentesque. Lorem mollis aliquam ut porttitor leo a diam
            sollicitudin. Feugiat in fermentum posuere urna nec tincidunt.
            Adipiscing elit duis tristique sollicitudin nibh sit amet nulla.
            nulla. Mauris pharetra et ultrices neque ornare aenean euismod
            elementum. Scelerisque mauris pellentesque pulvinar pellentesque
            habitant morbi tristique. Cursus in hac habitasse platea dictumst
            quisque sagittis purus. Gravida quis blandit turpis cursus in.
            Aliquam purus sit amet luctus venenatis. In iaculis nunc sed augue
            lacus. Ut sem viverra aliquet eget sit amet tellus cras. Ut lectus
            arcu bibendum Elementum nisi quis eleifend quam adipiscing vitae
            proin sagittis. Velit aliquet sagittis id consectetur purus ut
            faucibus pulvinar elementum. Ultrices eros in cursus turpis massa
            tincidunt dui ut. Sed faucibus turpis in eu mi bibendum neque
            egestas. Elit duis tristique sollicitudin nibh. In hendrerit gravida
            rutrum quisque non tellus orci. Amet nulla facilisi morbi tempus
            iaculis urna id volutpat lacus. Mi tempus imperdiet nulla malesuada
            pellentesque elit eget gravida cum. Laoreet non curabitur gravida
            arcu ac. Quis vel eros donec ac. Sagittis eu volutpat odio
            facilisis. Ullamcorper malesuada proin libero nunc consequat
            interdum varius sit. Mattis ullamcorper velit sed ullamcorper morbi
            tincidunt ornare massa eget. Et tortor at risus viverra adipiscing
            at in tellus. Nunc lobortis mattis aliquam faucibus purus in massa.
            Tristique nulla aliquet enim tortor at auctor. Imperdiet dui
            accumsan sit amet. Elit sed vulputate mi sit amet mauris quis
            imperdiet. At varius vel pharetra vel turpis nunc eget lorem dolor.
            Eget gravida cum sociis natoque. Est ultricies integer quis auctor.
            In dictum non consectetur a erat nam. Non diam phasellus vestibulum
            lorem. Ullamcorper eget nulla facilisi etiam dignissim diam. Natoque
            penatibus et magnis dis parturient. Ut etiam sit amet nisl purus in.
            Lectus nulla at volutpat diam ut venenatis. Velit euismod in
            pellentesque massa. Lectus magna fringilla urna porttitor rhoncus.
            Enim nunc faucibus a pellentesque. Quisque egestas diam in arcu
            cursus euismod quis viverra nibh. Et malesuada fames ac turpis
            egestas sed tempus. Tortor at auctor urna nunc id cursus metus
            aliquam eleifend. Turpis egestas maecenas pharetra convallis posuere
            morbi morbi leo. Eu augue ut lectus arcu bibendum at varius vel.
            Amet est placerat in egestas erat imperdiet sed euismod nisi. Orci
            ac auctor augue mauris augue neque gravida in. Aliquam sem et tortor
            consequat. Sed viverra tellus in hac. Lorem ipsum dolor sit amet
            consectetur adipiscing elit ut aliquam. Mi tempus imperdiet nulla
            malesuada. Consequat nisl vel pretium lectus quam id. Eget magna
            fermentum iaculis eu. Orci eu lobortis elementum nibh tellus
            molestie nunc non blandit. Nec nam aliquam sem et tortor. In massa
            tempor nec feugiat nisl pretium fusce. Nunc sed augue lacus viverra
            vitae. Blandit aliquam etiam erat velit scelerisque in. Urna id
            volutpat lacus laoreet non curabitur gravida arcu. Felis bibendum ut
            tristique et egestas. Nunc pulvinar sapien et ligula. Urna molestie
            at elementum eu facilisis sed odio. In vitae turpis massa sed
            elementum tempus. Bibendum est ultricies integer quis auctor elit.
            Duis tristique sollicitudin nibh sit amet commodo. Orci a
            scelerisque purus semper eget. Integer eget aliquet nibh praesent.
            Fames ac turpis egestas sed tempus urna. Arcu dictum varius duis at
            consectetur lorem donec massa. Velit dignissim sodales ut eu sem
            integer vitae justo. Faucibus in ornare quam viverra. Odio morbi
            quis commodo odio aenean sed adipiscing diam donec. Sit amet commodo
            nulla facilisi nullam vehicula ipsum. A condimentum vitae sapien
            pellentesque habitant morbi tristique senectus et. Ut etiam sit amet
            nisl purus in mollis. Ut tellus elementum sagittis vitae et leo duis
            ut. Dolor sit amet consectetur adipiscing elit duis tristique
            sollicitudin nibh. Quisque id diam vel quam elementum pulvinar etiam
            non. Viverra ipsum nunc aliquet bibendum enim. Libero volutpat sed
            cras ornare arcu dui vivamus arcu felis. In metus vulputate eu
            scelerisque felis imperdiet. Nisl purus in mollis nunc sed.
            Fermentum iaculis eu non diam phasellus vestibulum. Aliquam ultrices
            sagittis orci a scelerisque purus. Sit amet luctus venenatis lectus
            magna. Arcu cursus vitae congue mauris rhoncus. Orci sagittis eu
            volutpat odio facilisis. Aliquam malesuada bibendum arcu vitae
            elementum curabitur vitae nunc. Turpis egestas integer eget aliquet
            nibh praesent tristique magna. Iaculis eu non diam phasellus
            vestibulum lorem. Hac habitasse platea dictumst quisque. Tellus id
            interdum velit laoreet. Nec feugiat in fermentum posuere urna nec
            tincidunt praesent semper. Dignissim cras tincidunt feugiat. Lectus
            magna fringilla urna porttitor rhoncus dolor. Eros Eros in cursus
            turpis massa tincidunt dui. Odio ut sem nulla pharetra diam sit
            amet. Praesent tristique magna sit amet purus gravida quis blandit.
            Consectetur purus ut faucibus pulvinar elementum integer. Eu turpis
            egestas pretium aenean pharetra magna ac placerat. Ligula
            ullamcorper malesuada proin libero. Vel risus commodo viverra
            maecenas accumsan lacus vel. Tellus at urna condimentum mattis
            pellentesque id nibh tortor. Tempus iaculis urna id volutpat lacus
            laoreet non curabitur gravida. Aliquam purus sit amet luctus
            venenatis lectus magna. Sit amet mauris commodo quis. Massa id neque
            aliquam vestibulum morbi blandit. Pellentesque elit ullamcorper
            ullamcorper dignissim cras. Fermentum odio eu feugiat pretium.
            Adipiscing diam donec adipiscing tristique risus nec feugiat in
            fermentum. Erat imperdiet sed euismod nisi porta. Amet volutpat
            consequat mauris nunc congue. Euismod lacinia at quis risus sed
            vulputate. Mauris in aliquam sem fringilla ut morbi tincidunt.
            Tristique senectus et netus et malesuada. Pharetra diam sit amet
            nisl suscipit adipiscing bibendum. Dignissim suspendisse in est ante
            in nibh. Ullamcorper morbi tincidunt ornare massa. Id neque aliquam
            vestibulum morbi blandit cursus risus at ultrices. Risus in
            hendrerit gravida rutrum quisque non. Tincidunt dui ut ornare lectus
            sit. Ultrices dui sapien eget mi proin sed libero enim. Turpis
            egestas integer eget aliquet nibh. Vulputate odio ut enim blandit
            volutpat maecenas. Hac habitasse platea dictumst vestibulum rhoncus
            est pellentesque elit. Mattis vulputate enim nulla aliquet
            porttitor. Accumsan lacus vel facilisis volutpat est velit egestas
            dui. Pellentesque elit eget gravida cum sociis natoque penatibus et.
            Sit amet est placerat in egestas. Vestibulum lorem sed risus
            ultricies tristique. Lectus mauris ultrices eros in cursus turpis
            massa tincidunt. Sed id semper risus in hendrerit. Lobortis
            scelerisque fermentum dui faucibus in ornare quam viverra orci.
            Pulvinar proin gravida hendrerit lectus. A erat nam at lectus urna
            duis convallis convallis. Arcu cursus euismod quis viverra. Senectus
            et netus et malesuada fames ac turpis egestas. Eget aliquet nibh
            praesent tristique. Quam quisque id diam vel. Duis ut diam quam
            nulla porttitor massa id neque aliquam. Aliquam nulla facilisi cras
            fermentum odio eu feugiat. Mattis nunc sed blandit libero volutpat
            sed cras. Tempor orci eu lobortis elementum nibh tellus molestie
            nunc. Adipiscing bibendum est ultricies integer quis auctor.
          </div>
        </div>
      </div>
      <div class="dashboard dashboard-mobile">
        <div class="page-content">
          <div class="wrapper">Mobile content only</div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';

import MewConnect from '@myetherwallet/mewconnect-web-client';
import Portis from '@portis/web3';
import Web3ModalVue from 'web3modal-vue';

import { greaterThan } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import Preload from '@/views/preload.vue';

// import '@/styles/_common.less';
// import '@/styles/_modal.less';
// import '@/styles/_execute_modal.less';
// import '@/styles/_search_modal.less';
import { APIKeys } from './settings';
import { InitWalletPayload } from './store/modules/account/actions/wallet';
import { InitCallbacks } from './web3/callbacks';

export default Vue.extend({
  name: 'App',
  components: {
    Preload,
    Web3ModalVue
  },
  provide() {
    const provided = {};
    Object.defineProperty(provided, 'themeColors', {
      enumerable: true,
      get: () => this.colors
    });

    return provided;
  },
  data() {
    return {
      isLeftRailTransactions: true,
      theme: 'light',
      providerOptions: {
        mewconnect: {
          package: MewConnect,
          options: {
            infuraId: APIKeys.INFURA_PROJECT_ID
          }
        },
        portis: {
          package: Portis,
          options: {
            id: APIKeys.PORTUS_DAPP_ID
          }
        }
      },
      colors: {}
    };
  },
  computed: {
    ...mapGetters('account', {
      isWalletReady: 'isWalletReady',
      entireBalanceNative: 'entireBalance'
    }),
    showPreload(): boolean {
      return !this.isWalletReady && !this.$route.meta.skipPreloadScreen;
    },
    pageTitle(): string {
      const entireBalance = this.entireBalanceNative;
      if (greaterThan(entireBalance, 0)) {
        return `$${formatToNative(entireBalance)} • ${this.$t(
          'lblPageTitleSuffix'
        )}`;
      } else {
        return this.$t('lblPageTitleDefault') as string;
      }
    }
  },
  watch: {
    pageTitle(newVal: string, oldVal: string): void {
      if (newVal === oldVal) {
        return;
      }

      this.setPageTitle(newVal);
    }
  },
  mounted() {
    this.computeProviderColors();
    this.setI18n(this.$i18n);
    this.setPageTitle(this.pageTitle);
    this.setIsDetecting(true);
    this.$nextTick(async () => {
      const web3modal = this.$refs.web3modal as any;
      this.setWeb3Modal(web3modal);
      if (web3modal.cachedProvider) {
        const provider = await web3modal.connect();
        const providerWithCb = await InitCallbacks(provider);
        await this.initWallet({
          provider: providerWithCb.provider,
          providerBeforeCloseCb: providerWithCb.onDisconnectCb,
          injected: false
        } as InitWalletPayload);
      }
      this.setIsDetecting(false);
    });
  },
  methods: {
    ...mapActions({
      setI18n: 'setI18n'
    }),
    ...mapMutations('account', {
      setWeb3Modal: 'setWeb3Modal',
      setIsDetecting: 'setIsDetecting'
    }),
    ...mapActions('account', {
      initWallet: 'initWallet'
    }),
    setPageTitle(title: string): void {
      document.title = title;
    },
    async computeProviderColors(): Promise<void> {
      console.time('computeProviderColors');
      const computedStyle = getComputedStyle(document.documentElement);
      console.timeLog('computeProviderColors', 'computedStyle', computedStyle);
      const value = Object.values(computedStyle)
        .filter((item) => item.startsWith('--color'))
        .reduce((colors, color) => {
          return {
            ...colors,
            [color.replace('--color-', '')]:
              computedStyle.getPropertyValue(color)
          };
        }, {});
      console.timeLog('computeProviderColors', 'value is ready', value);

      this.colors = value;
      console.timeEnd('computeProviderColors');
    }
  }
});
</script>
