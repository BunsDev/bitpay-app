import {
  MoonpayPaymentData,
  RampPaymentData,
  SardinePaymentData,
  SimplexPaymentData,
  WyrePaymentData,
} from './buy-crypto.models';
import {BuyCryptoActionType, BuyCryptoActionTypes} from './buy-crypto.types';
import {handleWyreStatus} from '../../navigation/services/buy-crypto/utils/wyre-utils';

type BuyCryptoReduxPersistBlackList = string[];
export const buyCryptoReduxPersistBlackList: BuyCryptoReduxPersistBlackList =
  [];

export interface BuyCryptoState {
  moonpay: {[key in string]: MoonpayPaymentData};
  ramp: {[key in string]: RampPaymentData};
  sardine: {[key in string]: SardinePaymentData};
  simplex: {[key in string]: SimplexPaymentData};
  wyre: {[key in string]: WyrePaymentData};
}

const initialState: BuyCryptoState = {
  moonpay: {},
  ramp: {},
  sardine: {},
  simplex: {},
  wyre: {},
};

export const buyCryptoReducer = (
  state: BuyCryptoState = initialState,
  action: BuyCryptoActionType,
): BuyCryptoState => {
  switch (action.type) {
    case BuyCryptoActionTypes.SUCCESS_PAYMENT_REQUEST_MOONPAY:
      const {moonpayPaymentData} = action.payload;
      return {
        ...state,
        moonpay: {
          ...state.moonpay,
          [moonpayPaymentData.external_id]: moonpayPaymentData,
        },
      };

    case BuyCryptoActionTypes.UPDATE_PAYMENT_REQUEST_MOONPAY:
      const {moonpayIncomingData} = action.payload;

      if (
        moonpayIncomingData.externalId &&
        state.moonpay[moonpayIncomingData.externalId]
      ) {
        if (moonpayIncomingData.status) {
          state.moonpay[moonpayIncomingData.externalId].status =
            moonpayIncomingData.status;
        }
        if (moonpayIncomingData.transactionId) {
          state.moonpay[moonpayIncomingData.externalId].transaction_id =
            moonpayIncomingData.transactionId;
        }
        return {
          ...state,
          moonpay: {
            ...state.moonpay,
            [moonpayIncomingData.externalId]:
              state.moonpay[moonpayIncomingData.externalId],
          },
        };
      } else {
        return state;
      }

    case BuyCryptoActionTypes.REMOVE_PAYMENT_REQUEST_MOONPAY:
      const {externalId} = action.payload;
      const moonpayPaymentRequestsList = {...state.moonpay};
      delete moonpayPaymentRequestsList[externalId];

      return {
        ...state,
        moonpay: {...moonpayPaymentRequestsList},
      };

    case BuyCryptoActionTypes.SUCCESS_PAYMENT_REQUEST_RAMP:
      const {rampPaymentData} = action.payload;
      return {
        ...state,
        ramp: {
          ...state.ramp,
          [rampPaymentData.external_id]: rampPaymentData,
        },
      };

    case BuyCryptoActionTypes.UPDATE_PAYMENT_REQUEST_RAMP:
      const {rampIncomingData} = action.payload;

      if (
        rampIncomingData.rampExternalId &&
        state.ramp[rampIncomingData.rampExternalId]
      ) {
        if (rampIncomingData.status) {
          state.ramp[rampIncomingData.rampExternalId].status =
            rampIncomingData.status;
        }
        return {
          ...state,
          ramp: {
            ...state.ramp,
            [rampIncomingData.rampExternalId]:
              state.ramp[rampIncomingData.rampExternalId],
          },
        };
      } else {
        return state;
      }

    case BuyCryptoActionTypes.REMOVE_PAYMENT_REQUEST_RAMP:
      const {rampExternalId} = action.payload;
      const rampPaymentRequestsList = {...state.ramp};
      delete rampPaymentRequestsList[rampExternalId];

      return {
        ...state,
        ramp: {...rampPaymentRequestsList},
      };

    case BuyCryptoActionTypes.SUCCESS_PAYMENT_REQUEST_SARDINE:
      const {sardinePaymentData} = action.payload;
      return {
        ...state,
        sardine: {
          ...state.sardine,
          [sardinePaymentData.external_id]: sardinePaymentData,
        },
      };

    case BuyCryptoActionTypes.UPDATE_PAYMENT_REQUEST_SARDINE:
      const {sardineIncomingData} = action.payload;

      if (
        sardineIncomingData.sardineExternalId &&
        state.sardine[sardineIncomingData.sardineExternalId]
      ) {
        if (sardineIncomingData.status) {
          state.sardine[sardineIncomingData.sardineExternalId].status =
            sardineIncomingData.status;
        }
        if (sardineIncomingData.order_id) {
          state.sardine[sardineIncomingData.sardineExternalId].order_id =
            sardineIncomingData.order_id;
        }
        if (sardineIncomingData.cryptoAmount) {
          state.sardine[sardineIncomingData.sardineExternalId].crypto_amount =
            sardineIncomingData.cryptoAmount;
        }
        if (sardineIncomingData.transactionId) {
          state.sardine[sardineIncomingData.sardineExternalId].transaction_id =
            sardineIncomingData.transactionId;
        }
        return {
          ...state,
          sardine: {
            ...state.sardine,
            [sardineIncomingData.sardineExternalId]:
              state.sardine[sardineIncomingData.sardineExternalId],
          },
        };
      } else {
        return state;
      }

    case BuyCryptoActionTypes.REMOVE_PAYMENT_REQUEST_SARDINE:
      const {sardineExternalId} = action.payload;
      const sardinePaymentRequestsList = {...state.sardine};
      delete sardinePaymentRequestsList[sardineExternalId];

      return {
        ...state,
        sardine: {...sardinePaymentRequestsList},
      };

    case BuyCryptoActionTypes.SUCCESS_PAYMENT_REQUEST_SIMPLEX:
      const {simplexPaymentData} = action.payload;
      return {
        ...state,
        simplex: {
          ...state.simplex,
          [simplexPaymentData.payment_id]: simplexPaymentData,
        },
      };

    case BuyCryptoActionTypes.UPDATE_PAYMENT_REQUEST_SIMPLEX:
      const {simplexIncomingData} = action.payload;

      if (
        simplexIncomingData.paymentId &&
        state.simplex[simplexIncomingData.paymentId]
      ) {
        state.simplex[simplexIncomingData.paymentId].status =
          simplexIncomingData.success === 'true' ? 'success' : 'failed';
        return {
          ...state,
          simplex: {
            ...state.simplex,
            [simplexIncomingData.paymentId]:
              state.simplex[simplexIncomingData.paymentId],
          },
        };
      } else {
        return state;
      }

    case BuyCryptoActionTypes.REMOVE_PAYMENT_REQUEST_SIMPLEX:
      const {paymentId} = action.payload;
      const simplexPaymentRequestsList = {...state.simplex};
      delete simplexPaymentRequestsList[paymentId];

      return {
        ...state,
        simplex: {...simplexPaymentRequestsList},
      };

    case BuyCryptoActionTypes.SUCCESS_PAYMENT_REQUEST_WYRE:
      const {wyrePaymentData} = action.payload;
      if (wyrePaymentData.orderId) {
        if (wyrePaymentData.status) {
          wyrePaymentData.status = handleWyreStatus(wyrePaymentData.status);
        }
        return {
          ...state,
          wyre: {...state.wyre, [wyrePaymentData.orderId]: wyrePaymentData},
        };
      } else {
        return state;
      }

    case BuyCryptoActionTypes.REMOVE_PAYMENT_REQUEST_WYRE:
      const {orderId} = action.payload;
      const wyrePaymentRequestsList = {...state.wyre};
      delete wyrePaymentRequestsList[orderId];

      return {
        ...state,
        wyre: {...wyrePaymentRequestsList},
      };

    default:
      return state;
  }
};
