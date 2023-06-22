import {ColorSchemeName} from 'react-native';
import {AltCurrenciesRowProps} from '../../components/list/AltCurrenciesRow';
import {BottomNotificationConfig} from '../../components/modal/bottom-notification/BottomNotification';
import {Network} from '../../constants';
import {SettingsListType} from '../../navigation/tabs/settings/SettingsRoot';
import {DecryptPasswordConfig} from '../../navigation/wallet/components/DecryptEnterPasswordModal';
import {PaymentSentConfig} from '../../navigation/wallet/components/PaymentSent';
import {ModalId, FeedbackType} from './app.reducer';
import {AppActionType, AppActionTypes} from './app.types';

export const networkChanged = (network: Network): AppActionType => ({
  type: AppActionTypes.NETWORK_CHANGED,
  payload: network,
});

export const successAppInit = (): AppActionType => ({
  type: AppActionTypes.SUCCESS_APP_INIT,
});

export const appInitCompleted = (): AppActionType => ({
  type: AppActionTypes.APP_INIT_COMPLETE,
});

export const failedAppInit = (): AppActionType => ({
  type: AppActionTypes.FAILED_APP_INIT,
  payload: true,
});

export const appIsReadyForDeeplinking = (): AppActionType => ({
  type: AppActionTypes.APP_READY_FOR_DEEPLINKING,
});

export const setIntroCompleted = (): AppActionType => ({
  type: AppActionTypes.SET_INTRO_COMPLETED,
});

export const setOnboardingCompleted = (): AppActionType => ({
  type: AppActionTypes.SET_ONBOARDING_COMPLETED,
});

export const showOnGoingProcessModal = (message: string): AppActionType => ({
  type: AppActionTypes.SHOW_ONGOING_PROCESS_MODAL,
  payload: message,
});

export const dismissOnGoingProcessModal = (): AppActionType => ({
  type: AppActionTypes.DISMISS_ONGOING_PROCESS_MODAL,
});

export const showBottomNotificationModal = (
  config: BottomNotificationConfig,
): AppActionType => ({
  type: AppActionTypes.SHOW_BOTTOM_NOTIFICATION_MODAL,
  payload: config,
});

export const dismissBottomNotificationModal = (): AppActionType => ({
  type: AppActionTypes.DISMISS_BOTTOM_NOTIFICATION_MODAL,
});

export const resetBottomNotificationModalConfig = (): AppActionType => ({
  type: AppActionTypes.RESET_BOTTOM_NOTIFICATION_MODAL_CONFIG,
});

export const setColorScheme = (scheme: ColorSchemeName): AppActionType => ({
  type: AppActionTypes.SET_COLOR_SCHEME,
  payload: scheme,
});

export const setNotificationsAccepted = (
  notificationsAccepted: boolean,
): AppActionType => ({
  type: AppActionTypes.SET_NOTIFICATIONS_ACCEPTED,
  payload: notificationsAccepted,
});

export const setConfirmedTxAccepted = (
  confirmedTxAccepted: boolean,
): AppActionType => ({
  type: AppActionTypes.SET_CONFIRMED_TX_ACCEPTED,
  payload: confirmedTxAccepted,
});

export const setAnnouncementsAccepted = (
  announcementsAccepted: boolean,
): AppActionType => ({
  type: AppActionTypes.SET_ANNOUNCEMENTS_ACCEPTED,
  payload: announcementsAccepted,
});

export const setEmailNotificationsAccepted = (
  accepted: boolean,
  email: string | null,
): AppActionType => ({
  type: AppActionTypes.SET_EMAIL_NOTIFICATIONS_ACCEPTED,
  payload: {accepted, email},
});

export const setDefaultLanguage = (lng: string): AppActionType => ({
  type: AppActionTypes.SET_DEFAULT_LANGUAGE,
  payload: lng,
});

export const showDecryptPasswordModal = (
  decryptPasswordConfig: DecryptPasswordConfig,
): AppActionType => ({
  type: AppActionTypes.SHOW_DECRYPT_PASSWORD_MODAL,
  payload: decryptPasswordConfig,
});

export const dismissDecryptPasswordModal = (): AppActionType => ({
  type: AppActionTypes.DISMISS_DECRYPT_PASSWORD_MODAL,
});

export const resetDecryptPasswordConfig = (): AppActionType => ({
  type: AppActionTypes.RESET_DECRYPT_PASSWORD_CONFIG,
});

export const showPaymentSentModal = (
  PaymentSentConfig: PaymentSentConfig,
): AppActionType => ({
  type: AppActionTypes.SHOW_PAYMENT_SENT_MODAL,
  payload: PaymentSentConfig,
});

export const dismissPaymentSentModal = (): AppActionType => ({
  type: AppActionTypes.DISMISS_PAYMENT_SENT_MODAL,
});

export const resetPaymentSentConfig = (): AppActionType => ({
  type: AppActionTypes.RESET_PAYMENT_SENT_CONFIG,
});

export const showBlur = (value: boolean): AppActionType => ({
  type: AppActionTypes.SHOW_BLUR,
  payload: value,
});

export const showPortfolioValue = (value: boolean): AppActionType => ({
  type: AppActionTypes.SHOW_PORTFOLIO_VALUE,
  payload: value,
});

export const toggleHideAllBalances = (value?: boolean): AppActionType => ({
  type: AppActionTypes.TOGGLE_HIDE_ALL_BALANCES,
  payload: value,
});

export const updateSettingsListConfig = (
  listItem: SettingsListType,
): AppActionType => ({
  type: AppActionTypes.UPDATE_SETTINGS_LIST_CONFIG,
  payload: listItem,
});

export const addAltCurrencyList = (
  altCurrencyList: Array<AltCurrenciesRowProps>,
): AppActionType => ({
  type: AppActionTypes.ADD_ALT_CURRENCIES_LIST,
  altCurrencyList,
});

export const setDefaultAltCurrency = (
  defaultAltCurrency: AltCurrenciesRowProps,
): AppActionType => ({
  type: AppActionTypes.SET_DEFAULT_ALT_CURRENCY,
  defaultAltCurrency,
});

export const activeModalUpdated = (id: ModalId | null): AppActionType => ({
  type: AppActionTypes.ACTIVE_MODAL_UPDATED,
  payload: id,
});

export const setUserFeedback = (feedBack: FeedbackType): AppActionType => ({
  type: AppActionTypes.USER_FEEDBACK,
  payload: feedBack,
});
