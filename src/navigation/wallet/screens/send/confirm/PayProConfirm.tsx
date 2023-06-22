import {RouteProp, StackActions} from '@react-navigation/core';
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {WalletStackParamList} from '../../../WalletStack';
import {useAppDispatch, useAppSelector} from '../../../../../utils/hooks';
import SecureLockIcon from '../../../../../../assets/img/secure-lock.svg';
import {
  Recipient,
  TransactionProposal,
  TxDetails,
  Wallet,
} from '../../../../../store/wallet/wallet.models';
import SwipeButton from '../../../../../components/swipe-button/SwipeButton';
import {
  createPayProTxProposal,
  handleCreateTxProposalError,
  removeTxp,
  startSendPayment,
} from '../../../../../store/wallet/effects/send/send';
import PaymentSent from '../../../components/PaymentSent';
import {sleep} from '../../../../../utils/helper-methods';
import {startOnGoingProcessModal} from '../../../../../store/app/app.effects';
import {dismissOnGoingProcessModal} from '../../../../../store/app/app.actions';
import {BuildPayProWalletSelectorList} from '../../../../../store/wallet/utils/wallet';
import {
  Amount,
  ConfirmContainer,
  ConfirmScrollView,
  ExchangeRate,
  Fee,
  Header,
  RemainingTime,
  SendingFrom,
  SendingTo,
  WalletSelector,
} from './Shared';
import {AppActions} from '../../../../../store/app';
import {CustomErrorMessage} from '../../../components/ErrorMessages';
import {PayProOptions} from '../../../../../store/wallet/effects/paypro/paypro';
import {GetFeeOptions} from '../../../../../store/wallet/effects/fee/fee';
import {Memo} from './Memo';

export interface InvoiceMinerFee {
  satoshisPerByte: number;
  totalFee: number;
}
export interface Invoice {
  id: string;
  url: string;
  buyerProvidedInfo?: {
    selectedTransactionCurrency?: string;
  };
  exchangeRates: any;
  minerFees: {[currency: string]: InvoiceMinerFee};
  paymentSubtotals: {[currency: string]: number};
  paymentTotals: {[currency: string]: number};
  paymentDisplayTotals: {[currency: string]: string};
  price: number;
  amountPaid: number;
  displayAmountPaid: string;
  nonPayProPaymentReceived?: boolean;
  transactionCurrency: string;
  status: 'new' | 'paid' | 'confirmed' | 'complete' | 'expired' | 'invalid';
  expirationTime: number;
  merchantName: string;
  currency: string;
  oauth?: {
    coinbase?: {
      enabled: boolean;
      threshold: number;
    };
  };
}
export interface PayProConfirmParamList {
  wallet?: Wallet;
  recipient?: Recipient;
  txp?: TransactionProposal;
  txDetails?: TxDetails;
  payProOptions: PayProOptions;
  invoice: Invoice;
}

const PayProConfirm = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<WalletStackParamList, 'PayProConfirm'>>();
  const {
    payProOptions,
    wallet: _wallet,
    recipient: _recipient,
    txDetails: _txDetails,
    txp: _txp,
    invoice: _invoice,
  } = route.params!;
  const keys = useAppSelector(({WALLET}) => WALLET.keys);
  const defaultAltCurrency = useAppSelector(({APP}) => APP.defaultAltCurrency);

  const [walletSelectorVisible, setWalletSelectorVisible] = useState(false);

  const [key, setKey] = useState(keys[_wallet ? _wallet.keyId : '']);
  const [invoice, setInvoice] = useState<Invoice>(_invoice);
  const [wallet, setWallet] = useState(_wallet);
  const [recipient, setRecipient] = useState(_recipient);
  const [txDetails, updateTxDetails] = useState(_txDetails);
  const [txp, updateTxp] = useState(_txp);
  const {fee, sendingFrom, subTotal, total} = txDetails || {};
  const [resetSwipeButton, setResetSwipeButton] = useState(false);
  const [disableSwipeSendButton, setDisableSwipeSendButton] = useState(false);
  const payProHost = payProOptions.payProUrl
    .replace('https://', '')
    .split('/')[0];

  const memoizedKeysAndWalletsList = useMemo(
    () =>
      dispatch(
        BuildPayProWalletSelectorList({
          keys,
          defaultAltCurrencyIsoCode: defaultAltCurrency.isoCode,
          payProOptions,
          invoice,
        }),
      ),
    [defaultAltCurrency.isoCode, dispatch, keys, payProOptions, invoice],
  );

  const reshowWalletSelector = async () => {
    await sleep(400);
    setWalletSelectorVisible(true);
  };

  const createTxp = async (selectedWallet: Wallet) => {
    dispatch(startOnGoingProcessModal('CREATING_TXP'));
    try {
      const {txDetails: newTxDetails, txp: newTxp} = await dispatch(
        await createPayProTxProposal({
          wallet: selectedWallet,
          paymentUrl: payProOptions.payProUrl,
          payProOptions,
          invoiceID: payProOptions.paymentId,
          invoice,
        }),
      );
      setWallet(selectedWallet);
      setKey(keys[selectedWallet.keyId]);
      await sleep(400);
      dispatch(dismissOnGoingProcessModal());
      updateTxDetails(newTxDetails);
      updateTxp(newTxp);
      setRecipient({address: newTxDetails.sendingTo.recipientAddress} as {
        address: string;
      });
    } catch (err: any) {
      await sleep(400);
      dispatch(dismissOnGoingProcessModal());
      const [errorConfig] = await Promise.all([
        dispatch(handleCreateTxProposalError(err)),
        sleep(500),
      ]);
      dispatch(
        AppActions.showBottomNotificationModal(
          CustomErrorMessage({
            title: t('Error'),
            errMsg:
              err.response?.data?.message || err.message || errorConfig.message,
            action: () =>
              wallet ? navigation.goBack() : reshowWalletSelector(),
          }),
        ),
      );
    }
  };

  useEffect(() => {
    wallet ? createTxp(wallet) : setTimeout(() => openKeyWalletSelector(), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openKeyWalletSelector = () => {
    setWalletSelectorVisible(true);
  };

  const handleCreateGiftCardInvoiceOrTxpError = async (err: any) => {
    await sleep(400);
    dispatch(dismissOnGoingProcessModal());
    const [errorConfig] = await Promise.all([
      dispatch(handleCreateTxProposalError(err)),
      sleep(500),
    ]);
    dispatch(
      AppActions.showBottomNotificationModal(
        CustomErrorMessage({
          title: t('Error'),
          errMsg:
            err.response?.data?.message || err.message || errorConfig.message,
          action: () => reshowWalletSelector(),
        }),
      ),
    );
  };

  const onWalletSelect = async (selectedWallet: Wallet) => {
    setWalletSelectorVisible(false);
    // not ideal - will dive into why the timeout has to be this long
    await sleep(400);
    createTxp(selectedWallet);
  };

  const sendPayment = async (twoFactorCode?: string) => {
    dispatch(startOnGoingProcessModal('SENDING_PAYMENT'));
    txp && wallet && recipient
      ? await dispatch(startSendPayment({txp, key, wallet, recipient}))
      : null;
    dispatch(dismissOnGoingProcessModal());
    await sleep(400);
    dispatch(
      AppActions.showPaymentSentModal({
        onDismissModal: async () => {
          navigation.dispatch(StackActions.popToTop());
          navigation.navigate('Wallet', {
            screen: 'WalletDetails',
            params: {
              walletId: wallet!.id,
              key,
            },
          });
        },
      }),
    );
  };

  const showError = ({
    error,
    defaultErrorMessage,
    onDismiss,
  }: {
    error?: any;
    defaultErrorMessage: string;
    onDismiss?: () => Promise<void>;
  }) => {
    dispatch(
      AppActions.showBottomNotificationModal(
        CustomErrorMessage({
          title: t('Error'),
          errMsg: error?.message || defaultErrorMessage,
          action: () => onDismiss && onDismiss(),
        }),
      ),
    );
  };

  const handlePaymentFailure = async (error: any) => {
    dispatch(dismissOnGoingProcessModal());
    if (wallet && txp) {
      await removeTxp(wallet, txp).catch(removeErr =>
        console.error('error deleting txp', removeErr),
      );
    }
    updateTxDetails(undefined);
    updateTxp(undefined);
    setWallet(undefined);
    showError({
      error,
      defaultErrorMessage: t('Could not send transaction'),
      onDismiss: () => reshowWalletSelector(),
    });
    await sleep(400);
    setResetSwipeButton(true);
  };

  return (
    <ConfirmContainer>
      <ConfirmScrollView>
        <Header hr>Summary</Header>
        {invoice ? (
          <RemainingTime
            invoiceExpirationTime={invoice.expirationTime}
            setDisableSwipeSendButton={setDisableSwipeSendButton}
          />
        ) : null}
        <SendingTo
          recipient={{
            recipientName: payProHost,
            img: () => (
              <SecureLockIcon height={18} width={18} style={{marginTop: -2}} />
            ),
          }}
          hr
        />
        {wallet ? (
          <>
            <SendingFrom
              sender={sendingFrom!}
              onPress={openKeyWalletSelector}
              hr
            />
            {txDetails?.rateStr ? (
              <ExchangeRate
                description={t('Exchange Rate')}
                rateStr={txDetails?.rateStr}
              />
            ) : null}
            {txp ? (
              <Memo
                memo={txp.message}
                onChange={message => updateTxp({...txp, message})}
              />
            ) : null}
            <Amount description={'SubTotal'} amount={subTotal} height={83} hr />
            {wallet && fee ? (
              <Fee
                fee={fee}
                hideFeeOptions
                feeOptions={GetFeeOptions(wallet.chain)}
                hr
              />
            ) : null}
            <Amount description={'Total'} amount={total} height={83} />
          </>
        ) : null}

        <WalletSelector
          isVisible={walletSelectorVisible}
          setWalletSelectorVisible={setWalletSelectorVisible}
          walletsAndAccounts={memoizedKeysAndWalletsList}
          onWalletSelect={onWalletSelect}
          onCoinbaseAccountSelect={() => {}}
          onBackdropPress={async () => {
            setWalletSelectorVisible(false);
            if (!wallet) {
              await sleep(100);
              navigation.goBack();
            }
          }}
        />
      </ConfirmScrollView>
      {wallet ? (
        <>
          <SwipeButton
            disabled={disableSwipeSendButton}
            title={'Slide to send'}
            forceReset={resetSwipeButton}
            onSwipeComplete={async () => {
              try {
                await sendPayment();
              } catch (err: any) {
                dispatch(dismissOnGoingProcessModal());
                await sleep(400);
                await handlePaymentFailure(err);
              }
            }}
          />
        </>
      ) : null}
    </ConfirmContainer>
  );
};

export default PayProConfirm;
