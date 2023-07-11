import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  RouteProp,
  useNavigation,
  useRoute,
  useTheme,
} from '@react-navigation/native';
import {
  DeviceEventEmitter,
  FlatList,
  LogBox,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import WalletRow, {WalletRowProps} from '../../../components/list/WalletRow';
import {
  BaseText,
  H2,
  H5,
  HeaderTitle,
  ProposalBadge,
} from '../../../components/styled/Text';
import Settings from '../../../components/settings/Settings';
import {
  Hr,
  ActiveOpacity,
  ScreenGutter,
  HeaderRightContainer as _HeaderRightContainer,
  ProposalBadgeContainer,
} from '../../../components/styled/Containers';
import {
  showBottomNotificationModal,
  toggleHideAllBalances,
} from '../../../store/app/app.actions';
import {startUpdateAllWalletStatusForKey} from '../../../store/wallet/effects/status/status';
import {updatePortfolioBalance} from '../../../store/wallet/wallet.actions';
import {Wallet, Status} from '../../../store/wallet/wallet.models';
import {Rates} from '../../../store/rate/rate.models';
import {
  LightBlack,
  NeutralSlate,
  SlateDark,
  White,
} from '../../../styles/colors';
import {
  convertToFiat,
  formatFiatAmount,
  shouldScale,
} from '../../../utils/helper-methods';
import {BalanceUpdateError} from '../components/ErrorMessages';
import OptionsSheet, {Option} from '../components/OptionsSheet';
import Icons from '../components/WalletIcons';
import {WalletStackParamList} from '../WalletStack';
import ChevronDownSvg from '../../../../assets/img/chevron-down.svg';
import {
  AppDispatch,
  useAppDispatch,
  useAppSelector,
  useLogger,
} from '../../../utils/hooks';
import SheetModal from '../../../components/modal/base/sheet/SheetModal';
import KeyDropdownOption from '../components/KeyDropdownOption';
import {getPriceHistory, startGetRates} from '../../../store/wallet/effects';
import EncryptPasswordImg from '../../../../assets/img/tinyicon-encrypt.svg';
import EncryptPasswordDarkModeImg from '../../../../assets/img/tinyicon-encrypt-darkmode.svg';
import {useTranslation} from 'react-i18next';
import {toFiat} from '../../../store/wallet/utils/wallet';
import {each} from 'lodash';
import debounce from 'lodash.debounce';
import {DeviceEmitterEvents} from '../../../constants/device-emitter-events';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Row = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
`;

const OverviewContainer = styled.View`
  flex: 1;
`;

const BalanceContainer = styled.Pressable`
  height: 15%;
  margin-top: 20px;
  padding: 10px 15px;
  cursor: pointer;
`;

const Balance = styled(BaseText)<{scale: boolean}>`
  font-size: ${({scale}) => (scale ? 25 : 35)}px;
  font-style: normal;
  font-weight: 700;
  line-height: 53px;
  letter-spacing: 0;
  text-align: center;
`;

const WalletListHeader = styled.View`
  padding: 10px;
  margin-top: 10px;
`;

const WalletListFooter = styled.TouchableOpacity`
  padding: 10px;
  margin: 15px 0 50px 0;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`;

const WalletListFooterText = styled(BaseText)`
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0;
  margin-left: 10px;
`;

export const KeyToggle = styled(TouchableOpacity)`
  align-items: center;
  flex-direction: column;
  cursor: pointer;
`;

export const KeyDropdown = styled.SafeAreaView`
  background: ${({theme: {dark}}) => (dark ? LightBlack : White)};
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;

export const KeyDropdownOptionsContainer = styled.ScrollView`
  margin-left: ${ScreenGutter};
`;

const CogIconContainer = styled.TouchableOpacity`
  background-color: ${({theme: {dark}}) => (dark ? LightBlack : NeutralSlate)};
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 40px;
`;

const HeaderTitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const HeaderRightContainer = styled(_HeaderRightContainer)`
  flex-direction: row;
  align-items: center;
`;

export const buildUIFormattedWallet: (
  wallet: Wallet,
  defaultAltCurrencyIsoCode: string,
  rates: Rates,
  dispatch: AppDispatch,
  currencyDisplay?: 'symbol',
) => WalletRowProps = (
  {
    id,
    img,
    badgeImg,
    currencyName,
    currencyAbbreviation,
    chain,
    network,
    walletName,
    balance,
    credentials,
    keyId,
    isRefreshing,
    hideWallet,
    hideBalance,
    pendingTxps,
  },
  defaultAltCurrencyIsoCode,
  rates,
  dispatch,
  currencyDisplay,
) => ({
  id,
  keyId,
  img,
  badgeImg,
  currencyName,
  currencyAbbreviation: currencyAbbreviation.toUpperCase(),
  chain,
  walletName: walletName || credentials.walletName,
  cryptoBalance: balance.crypto,
  cryptoLockedBalance: balance.cryptoLocked,
  cryptoConfirmedLockedBalance: balance.cryptoConfirmedLocked,
  cryptoSpendableBalance: balance.cryptoSpendable,
  cryptoPendingBalance: balance.cryptoPending,
  fiatBalance: formatFiatAmount(
    convertToFiat(
      dispatch(
        toFiat(
          balance.sat,
          defaultAltCurrencyIsoCode,
          currencyAbbreviation,
          chain,
          rates,
        ),
      ),
      hideWallet,
      network,
    ),
    defaultAltCurrencyIsoCode,
    {
      currencyDisplay,
    },
  ),
  fiatLockedBalance: formatFiatAmount(
    convertToFiat(
      dispatch(
        toFiat(
          balance.satLocked,
          defaultAltCurrencyIsoCode,
          currencyAbbreviation,
          chain,
          rates,
        ),
      ),
      hideWallet,
      network,
    ),
    defaultAltCurrencyIsoCode,
    {
      currencyDisplay,
    },
  ),
  fiatConfirmedLockedBalance: formatFiatAmount(
    convertToFiat(
      dispatch(
        toFiat(
          balance.satConfirmedLocked,
          defaultAltCurrencyIsoCode,
          currencyAbbreviation,
          chain,
          rates,
        ),
      ),
      hideWallet,
      network,
    ),
    defaultAltCurrencyIsoCode,
    {
      currencyDisplay,
    },
  ),
  fiatSpendableBalance: formatFiatAmount(
    convertToFiat(
      dispatch(
        toFiat(
          balance.satSpendable,
          defaultAltCurrencyIsoCode,
          currencyAbbreviation,
          chain,
          rates,
        ),
      ),
      hideWallet,
      network,
    ),
    defaultAltCurrencyIsoCode,
    {
      currencyDisplay,
    },
  ),
  fiatPendingBalance: formatFiatAmount(
    convertToFiat(
      dispatch(
        toFiat(
          balance.satPending,
          defaultAltCurrencyIsoCode,
          currencyAbbreviation,
          chain,
          rates,
        ),
      ),
      hideWallet,
      network,
    ),
    defaultAltCurrencyIsoCode,
    {
      currencyDisplay,
    },
  ),
  network: network,
  isRefreshing,
  hideWallet,
  hideBalance,
  pendingTxps,
  multisig:
    credentials.n > 1
      ? `- Multisig ${credentials.m}/${credentials.n}`
      : undefined,
});

// Key overview list builder
export const buildNestedWalletList = (
  coins: Wallet[],
  tokens: Wallet[],
  defaultAltCurrencyIso: string,
  rates: Rates,
  dispatch: AppDispatch,
) => {
  const walletList = [] as Array<WalletRowProps>;

  coins.forEach(coin => {
    walletList.push({
      ...buildUIFormattedWallet(coin, defaultAltCurrencyIso, rates, dispatch),
    });
    // eth wallet with tokens -> for every token wallet ID grab full wallet from _tokens and add it to the list
    if (coin.tokens) {
      coin.tokens.forEach(id => {
        const tokenWallet = tokens.find(token => token.id === id);
        if (tokenWallet) {
          walletList.push({
            ...buildUIFormattedWallet(
              tokenWallet,
              defaultAltCurrencyIso,
              rates,
              dispatch,
            ),
            isToken: true,
          });
        }
      });
    }
  });

  return walletList;
};

const KeyOverview = () => {
  const {t} = useTranslation();
  const {
    params: {id, context},
  } = useRoute<RouteProp<WalletStackParamList, 'KeyOverview'>>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const logger = useLogger();
  const theme = useTheme();
  const [showKeyOptions, setShowKeyOptions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {keys} = useAppSelector(({WALLET}) => WALLET);
  const {rates} = useAppSelector(({RATE}) => RATE);
  const {defaultAltCurrency, hideAllBalances} = useAppSelector(({APP}) => APP);
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const key = keys[id];
  const hasMultipleKeys =
    Object.values(keys).filter(k => k.backupComplete).length > 1;
  let pendingTxps: any = [];
  each(key?.wallets, x => {
    if (x.pendingTxps) {
      pendingTxps = pendingTxps.concat(x.pendingTxps);
    }
  });
  useLayoutEffect(() => {
    if (!key) {
      return;
    }

    navigation.setOptions({
      headerTitle: () => {
        return (
          <KeyToggle
            activeOpacity={ActiveOpacity}
            onPress={() => setShowKeyDropdown(!showKeyDropdown)}>
            {key.methods?.isPrivKeyEncrypted() ? (
              theme.dark ? (
                <EncryptPasswordDarkModeImg />
              ) : (
                <EncryptPasswordImg />
              )
            ) : null}
            <HeaderTitleContainer>
              <HeaderTitle style={{textAlign: 'center'}}>
                {key?.keyName}
              </HeaderTitle>
              {hasMultipleKeys ? (
                <ChevronDownSvg style={{marginLeft: 10}} />
              ) : null}
            </HeaderTitleContainer>
          </KeyToggle>
        );
      },
      headerRight: () => {
        return (
          <>
            <HeaderRightContainer>
              {pendingTxps.length ? (
                <ProposalBadgeContainer
                  style={{marginRight: 10}}
                  onPress={onPressTxpBadge}>
                  <ProposalBadge>{pendingTxps.length}</ProposalBadge>
                </ProposalBadgeContainer>
              ) : null}
              {key?.methods?.isPrivKeyEncrypted() ? (
                <CogIconContainer
                  onPress={() =>
                    navigation.navigate('Wallet', {
                      screen: 'KeySettings',
                      params: {
                        key,
                      },
                    })
                  }
                  activeOpacity={ActiveOpacity}>
                  <Icons.Cog />
                </CogIconContainer>
              ) : (
                <>
                  <Settings
                    onPress={() => {
                      setShowKeyOptions(!showKeyOptions);
                    }}
                  />
                </>
              )}
            </HeaderRightContainer>
          </>
        );
      },
    });
  }, [
    navigation,
    showKeyDropdown,
    showKeyOptions,
    key,
    hasMultipleKeys,
    theme.dark,
  ]);

  useEffect(() => {
    if (context === 'createNewMultisigKey') {
      key?.wallets[0].getStatus(
        {network: key?.wallets[0].network},
        (err: any, status: Status) => {
          if (err) {
            const errStr =
              err instanceof Error ? err.message : JSON.stringify(err);
            logger.error(`error [getStatus]: ${errStr}`);
          } else {
            navigation.navigate('Wallet', {
              screen: 'Copayers',
              params: {
                wallet: key?.wallets[0],
                status: status?.wallet,
              },
            });
          }
        },
      );
    }
  }, [navigation, key?.wallets, context]);

  useEffect(() => {}, []);

  const {wallets = [], totalBalance} =
    useAppSelector(({WALLET}) => WALLET.keys[id]) || {};

  const memorizedWalletList = useMemo(() => {
    const coins = wallets.filter(
      wallet => !wallet.credentials.token && !wallet.hideWallet,
    );
    const tokens = wallets.filter(
      wallet => wallet.credentials.token && !wallet.hideWallet,
    );

    return buildNestedWalletList(
      coins,
      tokens,
      defaultAltCurrency.isoCode,
      rates,
      dispatch,
    );
  }, [dispatch, wallets, defaultAltCurrency.isoCode, rates]);

  const keyOptions: Array<Option> = [];

  if (!key?.methods?.isPrivKeyEncrypted()) {
    if (!key?.isReadOnly) {
      keyOptions.push({
        img: <Icons.Encrypt />,
        title: t('Encrypt your Key'),
        description: t(
          'Prevent an unauthorized user from sending funds out of your wallet.',
        ),
        onPress: () => {
          navigation.navigate('Wallet', {
            screen: 'CreateEncryptPassword',
            params: {
              key,
            },
          });
        },
      });
    }

    keyOptions.push({
      img: <Icons.Settings />,
      title: t('Key Settings'),
      description: t('View all the ways to manage and configure your key.'),
      onPress: () => {
        navigation.navigate('Wallet', {
          screen: 'KeySettings',
          params: {
            key,
          },
        });
      },
    });
  }

  const onPressTxpBadge = useMemo(
    () => () => {
      navigation.navigate('Wallet', {
        screen: 'TransactionProposalNotifications',
        params: {keyId: key.id},
      });
    },
    [],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      dispatch(getPriceHistory(defaultAltCurrency.isoCode));
      await dispatch(startGetRates({force: true}));
      await dispatch(startUpdateAllWalletStatusForKey({key, force: true}));
      dispatch(updatePortfolioBalance());
    } catch (err) {
      dispatch(showBottomNotificationModal(BalanceUpdateError()));
    }
    setRefreshing(false);
  };

  const memoizedRenderItem = useCallback(
    ({item}: {item: WalletRowProps}) => {
      return (
        <WalletRow
          id={item.id}
          wallet={item}
          hideBalance={hideAllBalances}
          onPress={() => {
            const fullWalletObj = key.wallets.find(k => k.id === item.id)!;
            if (!fullWalletObj.isComplete()) {
              fullWalletObj.getStatus(
                {network: fullWalletObj.network},
                (err: any, status: Status) => {
                  if (err) {
                    const errStr =
                      err instanceof Error ? err.message : JSON.stringify(err);
                    logger.error(`error [getStatus]: ${errStr}`);
                  } else {
                    if (status?.wallet?.status === 'complete') {
                      fullWalletObj.openWallet({}, () => {
                        navigation.navigate('Wallet', {
                          screen: 'WalletDetails',
                          params: {
                            walletId: item.id,
                            key,
                          },
                        });
                      });
                      return;
                    }
                    navigation.navigate('Wallet', {
                      screen: 'Copayers',
                      params: {
                        wallet: fullWalletObj,
                        status: status?.wallet,
                      },
                    });
                  }
                },
              );
            } else {
              navigation.navigate('Wallet', {
                screen: 'WalletDetails',
                params: {
                  key,
                  walletId: item.id,
                },
              });
            }
          }}
        />
      );
    },
    [key, navigation, hideAllBalances],
  );

  const updateBalanceDebounce = debounce(
    () => {
      DeviceEventEmitter.emit(DeviceEmitterEvents.WALLET_UPDATE_BALANCE, true);
    },
    10000,
    {leading: true, trailing: false},
  );

  return (
    <OverviewContainer>
      <BalanceContainer
        onPress={updateBalanceDebounce}
        onLongPress={() => {
          dispatch(toggleHideAllBalances());
        }}>
        <Row>
          {!hideAllBalances ? (
            <Balance scale={shouldScale(totalBalance)}>
              {formatFiatAmount(totalBalance, defaultAltCurrency.isoCode, {
                currencyDisplay: 'symbol',
              })}
            </Balance>
          ) : (
            <H2>****</H2>
          )}
        </Row>
      </BalanceContainer>

      <Hr />

      <FlatList<WalletRowProps>
        refreshControl={
          <RefreshControl
            tintColor={theme.dark ? White : SlateDark}
            refreshing={refreshing}
            onRefresh={() => onRefresh()}
          />
        }
        ListHeaderComponent={() => {
          return (
            <WalletListHeader>
              <H5>{t('My Wallets')}</H5>
            </WalletListHeader>
          );
        }}
        ListFooterComponent={() => {
          return (
            <WalletListFooter
              activeOpacity={ActiveOpacity}
              onPress={() => {
                navigation.navigate('Wallet', {
                  screen: 'AddingOptions',
                  params: {
                    key,
                  },
                });
              }}>
              <Icons.Add />
              <WalletListFooterText>{t('Add Wallet')}</WalletListFooterText>
            </WalletListFooter>
          );
        }}
        data={memorizedWalletList}
        renderItem={memoizedRenderItem}
      />

      {keyOptions.length > 0 ? (
        <OptionsSheet
          isVisible={showKeyOptions}
          title={t('Key Options')}
          options={keyOptions}
          closeModal={() => setShowKeyOptions(false)}
        />
      ) : null}

      {Object.values(keys).length > 0 ? (
        <SheetModal
          isVisible={showKeyDropdown}
          useMaxHeight={'100%'}
          placement={'top'}
          onBackdropPress={() => setShowKeyDropdown(false)}>
          <KeyDropdown>
            <HeaderTitle style={{margin: 15}}>{t('Other Keys')}</HeaderTitle>
            <KeyDropdownOptionsContainer>
              {Object.values(keys)
                .filter(_key => _key.backupComplete && _key.id !== id)
                .map(_key => (
                  <KeyDropdownOption
                    key={_key.id}
                    keyId={_key.id}
                    keyName={_key.keyName}
                    wallets={_key.wallets}
                    totalBalance={_key.totalBalance}
                    onPress={keyId => {
                      setShowKeyDropdown(false);
                      navigation.setParams({
                        id: keyId,
                      } as any);
                    }}
                    defaultAltCurrencyIsoCode={defaultAltCurrency.isoCode}
                    hideKeyBalance={hideAllBalances}
                  />
                ))}
            </KeyDropdownOptionsContainer>
          </KeyDropdown>
        </SheetModal>
      ) : null}
    </OverviewContainer>
  );
};

export default KeyOverview;
