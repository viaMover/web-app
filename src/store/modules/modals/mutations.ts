import { MutationFuncs } from '@/store/types';

import { ModalsStoreState, ModalState, TModalKey } from './types';

enum Mutations {
  pushStack,
  popStack,
  setStateEntry,
  setIsStateEntryVisible
}

const mutations: MutationFuncs<typeof Mutations, ModalsStoreState> = {
  pushStack(state, entry: TModalKey): void {
    state.stack = [entry, ...state.stack];
  },
  popStack(state, count = 1): void {
    state.stack.splice(0, count);
  },
  setStateEntry(
    state,
    args: { id: TModalKey; state: ModalState<TModalKey> }
  ): void {
    state.state[args.id] = {
      ...state.state[args.id],
      ...args.state
    };
  },
  setIsStateEntryVisible(
    state,
    args: { id: TModalKey; isVisible: boolean }
  ): void {
    state.state[args.id].isVisible = args.isVisible;
  }
};

export type MutationType = typeof mutations;
export default mutations;
