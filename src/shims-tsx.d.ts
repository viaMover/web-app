import Vue, { VNode } from 'vue';
import Web3 from 'web3';
import intercom from 'intercom-web';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    type Element = VNode;
    // tslint:disable no-empty-interface
    type ElementClass = Vue;
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [elem: string]: any;
    }
  }
  interface Window {
    ethereum?: any;
  }
}
