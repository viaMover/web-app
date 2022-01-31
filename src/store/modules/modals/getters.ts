import { ModalsStoreState, TModalKey } from '@/store/modules/modals/types';
import { GettersFuncs } from '@/store/types';

type Getters = {
  isDisplayed: (id: TModalKey) => boolean;
};

const getters: GettersFuncs<Getters, ModalsStoreState> = {
  isDisplayed(state): (id: TModalKey) => boolean {
    return (id) => {
      return state.state[id].isDisplayed;
    };
  }
};

export type GetterType = typeof getters;
export default getters;
