<template>
  <div class="preload">
    <div class="preload-wrapper">
      <div class="preload-wrapper__sidebar">
        <a class="logo" href="#">
          <img alt="logo" src="@/assets/images/logo.svg" />
        </a>
        <div class="sidebar-wrapper">
          <div class="preload-wrapper__sidebar-wrapper">
            <div class="preload-wrapper__sidebar-wrapper-user">
              <div class="user-icon"></div>
              <div class="user-button"></div>
              <div class="user-status"></div>
            </div>
            <div class="preload-wrapper__sidebar-wrapper-items">
              <div class="items-item">
                <div class="items-item__title"></div>
                <div class="items-item__text"></div>
                <div class="items-item__description"></div>
                <div class="items-item__text"></div>
                <div class="items-item__description"></div>
              </div>
              <div class="items-item">
                <div class="items-item__title"></div>
                <div class="items-item__text"></div>
                <div class="items-item__description"></div>
                <div class="items-item__text"></div>
                <div class="items-item__description"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="preload-wrapper__menu">
        <div class="g-wrapper">
          <div class="preload-wrapper__menu-wrapper">
            <div class="preload-wrapper__menu-wrapper-item">
              <div class="preload-wrapper__menu-wrapper-item-top">
                <div class="title"></div>
                <div class="description"></div>
              </div>
            </div>
            <div class="preload-wrapper__menu-wrapper-item">
              <div class="preload-wrapper__menu-wrapper-item-center">
                <div class="item">
                  <div class="item__title"></div>
                  <div class="item__description"></div>
                </div>
                <div class="item">
                  <div class="item__title"></div>
                  <div class="item__description"></div>
                </div>
              </div>
            </div>
            <div class="preload-wrapper__menu-wrapper-item">
              <div class="preload-wrapper__menu-wrapper-item-bottom">
                <div class="title"></div>
                <div class="description"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Preload'
});
</script>
