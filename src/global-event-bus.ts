import Vue from 'vue';

import { TopMessageType } from './components/modals';

export const globalEventBus = new Vue();

export const GlobalTopMessageEvent = 'global-top-message';

export type GlobalTopMessagePayload = {
  text: string;
  type: TopMessageType;
};

export const sendGlobalTopMessageEvent = (
  text: string,
  type: TopMessageType
): void => {
  globalEventBus.$emit(GlobalTopMessageEvent, {
    text: text,
    type: type
  } as GlobalTopMessagePayload);
};
