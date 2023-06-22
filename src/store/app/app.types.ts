import {ColorSchemeName} from 'react-native';
import {BottomNotificationConfig} from '../../components/modal/bottom-notification/BottomNotification';
import {Network} from '../../constants';
import {DecryptPasswordConfig} from '../../navigation/wallet/components/DecryptEnterPasswordModal';
import {PaymentSentConfig} from '../../navigation/wallet/components/PaymentSent';
import {AppIdentity} from './app.models';
import {SettingsListType} from '../../navigation/tabs/settings/SettingsRoot';
import {AltCurrenciesRowProps} from '../../components/list/AltCurrenciesRow';
import {FeedbackType, ModalId} from './app.reducer';

export enum AppActionTypes {
  NETWORK_CHANGED = 'APP/NETWORK_CHANGED',
  SUCCESS_APP_INIT = 'APP/SUCCESS_APP_INIT',
  APP_INIT_COMPLETE = 'APP/APP_INIT_COMPLETE',
  FAILED_APP_INIT = 'APP/FAILED_APP_INIT',
  APP_READY_FOR_DEEPLINKING = 'APP/READY_FOR_DEEPLINKING',
  SET_APP_FIRST_OPEN_EVENT_COMPLETE = 'APP/SET_APP_FIRST_OPEN_EVENT_COMPLETE',
  SET_APP_FIRST_OPEN_DATE = 'APP/SET_APP_FIRST_OPEN_DATE',
  SET_INTRO_COMPLETED = 'APP/SET_INTRO_COMPLETED',
  SET_ONBOARDING_COMPLETED = 'APP/SET_ONBOARDING_COMPLETED',
  SHOW_ONGOING_PROCESS_MODAL = 'APP/SHOW_ONGOING_PROCESS_MODAL',
  DISMISS_ONGOING_PROCESS_MODAL = 'APP/DISMISS_ONGOING_PROCESS_MODAL',
  SHOW_BOTTOM_NOTIFICATION_MODAL = 'APP/SHOW_BOTTOM_NOTIFICATION_MODAL',
  DISMISS_BOTTOM_NOTIFICATION_MODAL = 'APP/DISMISS_BOTTOM_NOTIFICATION_MODAL',
  RESET_BOTTOM_NOTIFICATION_MODAL_CONFIG = 'APP/RESET_BOTTOM_NOTIFICATION_MODAL_CONFIG',
  SET_COLOR_SCHEME = 'APP/SET_COLOR_SCHEME',
  SUCCESS_GENERATE_APP_IDENTITY = 'APP/SUCCESS_GENERATE_APP_IDENTITY',
  FAILED_GENERATE_APP_IDENTITY = 'APP/FAILED_GENERATE_APP_IDENTITY',
  SET_NOTIFICATIONS_ACCEPTED = 'APP/SET_NOTIFICATIONS_ACCEPTED',
  SET_CONFIRMED_TX_ACCEPTED = 'APP/SET_CONFIRMED_TX_ACCEPTED',
  SET_ANNOUNCEMENTS_ACCEPTED = 'APP/SET_ANNOUNCEMENTS_ACCEPTED',
  SET_EMAIL_NOTIFICATIONS_ACCEPTED = 'APP/SET_EMAIL_NOTIFICATIONS_ACCEPTED',
  SHOW_ONBOARDING_FINISH_MODAL = 'APP/SHOW_ONBOARDING_FINISH_MODAL',
  DISMISS_ONBOARDING_FINISH_MODAL = 'APP/DISMISS_ONBOARDING_FINISH_MODAL',
  SHOW_DECRYPT_PASSWORD_MODAL = 'APP/SHOW_DECRYPT_PASSWORD_MODAL',
  DISMISS_DECRYPT_PASSWORD_MODAL = 'APP/DISMISS_DECRYPT_PASSWORD_MODAL',
  RESET_DECRYPT_PASSWORD_CONFIG = 'APP/RESET_DECRYPT_PASSWORD_CONFIG',
  SHOW_PAYMENT_SENT_MODAL = 'APP/SHOW_PAYMENT_SENT_MODAL',
  DISMISS_PAYMENT_SENT_MODAL = 'APP/DISMISS_PAYMENT_SENT_MODAL',
  RESET_PAYMENT_SENT_CONFIG = 'APP/RESET_PAYMENT_SENT_CONFIG',
  SET_DEFAULT_LANGUAGE = 'APP/SET_DEFAULT_LANGUAGE',
  SHOW_BLUR = 'APP/SHOW_BLUR',
  SHOW_PORTFOLIO_VALUE = 'APP/SHOW_PORTFOLIO_VALUE',
  TOGGLE_HIDE_ALL_BALANCES = 'APP/TOGGLE_HIDE_ALL_BALANCES',
  LOCK_AUTHORIZED_UNTIL = 'APP/LOCK_AUTHORIZED_UNTIL',
  SET_HOME_CAROUSEL_CONFIG = 'APP/SET_HOME_CAROUSEL_CONFIG',
  SET_HOME_CAROUSEL_LAYOUT_TYPE = 'APP/SET_HOME_CAROUSEL_LAYOUT_TYPE',
  UPDATE_SETTINGS_LIST_CONFIG = 'APP/UPDATE_SETTINGS_LIST_CONFIG',
  ADD_ALT_CURRENCIES_LIST = 'APP/ADD_ALT_CURRENCIES_LIST',
  SET_DEFAULT_ALT_CURRENCY = 'APP/SET_DEFAULT_ALT_CURRENCY',
  SET_MIGRATION_COMPLETE = 'APP/SET_MIGRATION_COMPLETE',
  SET_KEY_MIGRATION_FAILURE = 'APP/SET_KEY_MIGRATION_FAILURE',
  SET_SHOW_KEY_MIGRATION_FAILURE_MODAL = 'APP/SET_SHOW_KEY_MIGRATION_FAILURE_MODAL',
  SET_KEY_MIGRATION_FAILURE_MODAL_HAS_BEEN_SHOWN = 'APP/SET_KEY_MIGRATION_FAILURE_MODAL_HAS_BEEN_SHOWN',
  ACTIVE_MODAL_UPDATED = 'APP/ACTIVE_MODAL_UPDATED',
  CHECKING_BIOMETRIC_FOR_SENDING = 'APP/CHECKING_BIOMETRIC_FOR_SENDING',
  USER_FEEDBACK = 'APP/USER_FEEDBACK',
}

interface NetworkChanged {
  type: typeof AppActionTypes.NETWORK_CHANGED;
  payload: Network;
}

interface SuccessAppInit {
  type: typeof AppActionTypes.SUCCESS_APP_INIT;
}

interface AppInitComplete {
  type: typeof AppActionTypes.APP_INIT_COMPLETE;
}

interface FailedAppInit {
  type: typeof AppActionTypes.FAILED_APP_INIT;
  payload: boolean;
}

interface AppIsReadyForDeeplinking {
  type: typeof AppActionTypes.APP_READY_FOR_DEEPLINKING;
}

interface setAppFirstOpenEventComplete {
  type: typeof AppActionTypes.SET_APP_FIRST_OPEN_EVENT_COMPLETE;
}

interface setAppFirstOpenDate {
  type: typeof AppActionTypes.SET_APP_FIRST_OPEN_DATE;
  payload: number;
}

interface SetIntroCompleted {
  type: typeof AppActionTypes.SET_INTRO_COMPLETED;
}

interface SetOnboardingCompleted {
  type: typeof AppActionTypes.SET_ONBOARDING_COMPLETED;
}

interface ShowOnGoingProcessModal {
  type: typeof AppActionTypes.SHOW_ONGOING_PROCESS_MODAL;
  payload: string;
}

interface DismissOnGoingProcessModal {
  type: typeof AppActionTypes.DISMISS_ONGOING_PROCESS_MODAL;
}

interface ShowBottomNotificationModal {
  type: typeof AppActionTypes.SHOW_BOTTOM_NOTIFICATION_MODAL;
  payload: BottomNotificationConfig;
}

interface DismissBottomNotificationModal {
  type: typeof AppActionTypes.DISMISS_BOTTOM_NOTIFICATION_MODAL;
}

interface ResetBottomNotificationModalConfig {
  type: typeof AppActionTypes.RESET_BOTTOM_NOTIFICATION_MODAL_CONFIG;
}

interface SetColorScheme {
  type: typeof AppActionTypes.SET_COLOR_SCHEME;
  payload: ColorSchemeName;
}

interface SuccessGenerateAppIdentity {
  type: typeof AppActionTypes.SUCCESS_GENERATE_APP_IDENTITY;
  payload: {network: Network; identity: AppIdentity};
}

interface FailedGenerateAppIdentity {
  type: typeof AppActionTypes.FAILED_GENERATE_APP_IDENTITY;
}

interface SetNotificationsAccepted {
  type: typeof AppActionTypes.SET_NOTIFICATIONS_ACCEPTED;
  payload: boolean;
}

interface SetConfirmedTxAccepted {
  type: typeof AppActionTypes.SET_CONFIRMED_TX_ACCEPTED;
  payload: boolean;
}

interface SetAnnouncementsAccepted {
  type: typeof AppActionTypes.SET_ANNOUNCEMENTS_ACCEPTED;
  payload: boolean;
}

interface SetEmailNotificationsAccepted {
  type: typeof AppActionTypes.SET_EMAIL_NOTIFICATIONS_ACCEPTED;
  payload: {accepted: boolean; email: string | null};
}

interface ShowOnboardingFinishModal {
  type: typeof AppActionTypes.SHOW_ONBOARDING_FINISH_MODAL;
}

interface DismissOnboardingFinishModal {
  type: typeof AppActionTypes.DISMISS_ONBOARDING_FINISH_MODAL;
}

interface SetDefaultLanguage {
  type: typeof AppActionTypes.SET_DEFAULT_LANGUAGE;
  payload: string;
}

interface ShowDecryptPasswordModal {
  type: typeof AppActionTypes.SHOW_DECRYPT_PASSWORD_MODAL;
  payload: DecryptPasswordConfig;
}

interface DismissDecryptPasswordModal {
  type: typeof AppActionTypes.DISMISS_DECRYPT_PASSWORD_MODAL;
}

interface ResetDecryptPasswordConfig {
  type: typeof AppActionTypes.RESET_DECRYPT_PASSWORD_CONFIG;
}

interface ShowPaymentSentModal {
  type: typeof AppActionTypes.SHOW_PAYMENT_SENT_MODAL;
  payload: PaymentSentConfig;
}

interface DismissPaymentSentModal {
  type: typeof AppActionTypes.DISMISS_PAYMENT_SENT_MODAL;
}

interface ResetPaymentSentConfig {
  type: typeof AppActionTypes.RESET_PAYMENT_SENT_CONFIG;
}

interface ShowBottomNotificationModal {
  type: typeof AppActionTypes.SHOW_BOTTOM_NOTIFICATION_MODAL;
  payload: BottomNotificationConfig;
}

interface LockAuthorizedUntil {
  type: typeof AppActionTypes.LOCK_AUTHORIZED_UNTIL;
  payload: number | undefined;
}

interface ShowBlur {
  type: typeof AppActionTypes.SHOW_BLUR;
  payload: boolean;
}

interface ShowPortfolioValue {
  type: typeof AppActionTypes.SHOW_PORTFOLIO_VALUE;
  payload: boolean;
}

interface ToggleHideAllBalances {
  type: typeof AppActionTypes.TOGGLE_HIDE_ALL_BALANCES;
  payload?: boolean;
}

interface updateSettingsListConfigType {
  type: typeof AppActionTypes.UPDATE_SETTINGS_LIST_CONFIG;
  payload: SettingsListType;
}

interface AddAltCurrencyList {
  type: typeof AppActionTypes.ADD_ALT_CURRENCIES_LIST;
  altCurrencyList: Array<AltCurrenciesRowProps>;
}

interface SetDefaultAltCurrency {
  type: typeof AppActionTypes.SET_DEFAULT_ALT_CURRENCY;
  defaultAltCurrency: AltCurrenciesRowProps;
}

interface SetMigrationComplete {
  type: typeof AppActionTypes.SET_MIGRATION_COMPLETE;
}

interface SetKeyMigrationFailure {
  type: typeof AppActionTypes.SET_KEY_MIGRATION_FAILURE;
}

interface SetShowKeyMigrationFailureModal {
  type: typeof AppActionTypes.SET_SHOW_KEY_MIGRATION_FAILURE_MODAL;
  payload: boolean;
}

interface SetKeyMigrationFailureModalHasBeenShown {
  type: typeof AppActionTypes.SET_KEY_MIGRATION_FAILURE_MODAL_HAS_BEEN_SHOWN;
}

interface ActiveModalUpdated {
  type: typeof AppActionTypes.ACTIVE_MODAL_UPDATED;
  payload: ModalId | null;
}

interface checkingBiometricForSending {
  type: typeof AppActionTypes.CHECKING_BIOMETRIC_FOR_SENDING;
  payload: boolean;
}

interface setUserFeedback {
  type: typeof AppActionTypes.USER_FEEDBACK;
  payload: FeedbackType;
}

export type AppActionType =
  | NetworkChanged
  | SuccessAppInit
  | AppInitComplete
  | FailedAppInit
  | AppIsReadyForDeeplinking
  | setAppFirstOpenEventComplete
  | setAppFirstOpenDate
  | setUserFeedback
  | SetIntroCompleted
  | SetOnboardingCompleted
  | ShowOnGoingProcessModal
  | DismissOnGoingProcessModal
  | ShowBottomNotificationModal
  | DismissBottomNotificationModal
  | ResetBottomNotificationModalConfig
  | SetColorScheme
  | SuccessGenerateAppIdentity
  | FailedGenerateAppIdentity
  | SetNotificationsAccepted
  | SetConfirmedTxAccepted
  | SetAnnouncementsAccepted
  | SetEmailNotificationsAccepted
  | ShowOnboardingFinishModal
  | DismissOnboardingFinishModal
  | SetDefaultLanguage
  | ShowDecryptPasswordModal
  | DismissDecryptPasswordModal
  | ResetDecryptPasswordConfig
  | ShowPaymentSentModal
  | DismissPaymentSentModal
  | ResetPaymentSentConfig
  | ShowBlur
  | ShowPortfolioValue
  | ToggleHideAllBalances
  | LockAuthorizedUntil
  | updateSettingsListConfigType
  | AddAltCurrencyList
  | SetMigrationComplete
  | SetKeyMigrationFailure
  | SetShowKeyMigrationFailureModal
  | SetKeyMigrationFailureModalHasBeenShown
  | SetDefaultAltCurrency
  | ActiveModalUpdated
  | checkingBiometricForSending;
