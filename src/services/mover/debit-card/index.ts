export { DebitCardApiError } from './types';

export {
  getCardInfo,
  orderCard,
  validatePhoneNumber,
  changePhoneNumber,
  sendEmailHash
} from './service';

export type {
  CardStatus,
  EventHistoryItemMinimal,
  ChangePhoneNumberReturn,
  OrderCardReturn,
  ValidatePhoneNumberReturn,
  CardInfo
} from './types';
