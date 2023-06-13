import React, {useEffect, useLayoutEffect} from 'react';
import {
  BaseText,
  HeaderTitle,
  Link,
  InfoTitle,
  InfoHeader,
  InfoDescription,
} from '../../../components/styled/Text';
import {useNavigation, useRoute} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/core';
import {WalletStackParamList} from '../WalletStack';
import {View, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {
  ActiveOpacity,
  Hr,
  Info,
  InfoTriangle,
  ScreenGutter,
  Setting,
  SettingTitle,
  SettingView,
  InfoImageContainer,
} from '../../../components/styled/Containers';
import ChevronRightSvg from '../../../../assets/img/angle-right.svg';
import WalletSettingsRow from '../../../components/list/WalletSettingsRow';
import {SlateDark, White} from '../../../styles/colors';
import {
  openUrlWithInAppBrowser,
  startOnGoingProcessModal,
} from '../../../store/app/app.effects';
import InfoSvg from '../../../../assets/img/info.svg';
import RequestEncryptPasswordToggle from '../components/RequestEncryptPasswordToggle';
import {buildNestedWalletList} from './KeyOverview';
import {URL} from '../../../constants';
import {getMnemonic} from '../../../utils/helper-methods';
import {useAppDispatch, useAppSelector} from '../../../utils/hooks';
import {AppActions} from '../../../store/app';
import {sleep} from '../../../utils/helper-methods';
import {
  dismissOnGoingProcessModal,
  showBottomNotificationModal,
  toggleHideAllBalances,
} from '../../../store/app/app.actions';
import {
  CustomErrorMessage,
  WrongPasswordError,
} from '../components/ErrorMessages';
import {
  buildWalletObj,
  generateKeyExportCode,
  mapAbbreviationAndName,
} from '../../../store/wallet/utils/wallet';
import {Key} from '../../../store/wallet/wallet.models';
import {
  normalizeMnemonic,
  serverAssistedImport,
} from '../../../store/wallet/effects';
import merge from 'lodash.merge';
import {syncWallets} from '../../../store/wallet/wallet.actions';
import {BWCErrorMessage} from '../../../constants/BWCError';
import {RootState} from '../../../store';
import {BitpaySupportedTokenOpts} from '../../../constants/tokens';
import ToggleSwitch from '../../../components/toggle-switch/ToggleSwitch';
import {useTranslation} from 'react-i18next';

const WalletSettingsContainer = styled.View`
  flex: 1;
`;

const ScrollContainer = styled.ScrollView`
  margin-left: ${ScreenGutter};
`;

const Title = styled(BaseText)`
  font-weight: bold;
  font-size: 18px;
  margin: 5px 0;
  color: ${({theme}) => theme.colors.text};
`;

const WalletHeaderContainer = styled.View`
  padding-top: ${ScreenGutter};
  flex-direction: row;
  align-items: center;
`;

const WalletNameContainer = styled.TouchableOpacity`
  padding: 10px 0 20px 0;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const VerticalPadding = styled.View`
  padding: ${ScreenGutter} 0;
`;

const WalletSettingsTitle = styled(SettingTitle)`
  color: ${({theme: {dark}}) => (dark ? White : SlateDark)};
`;

const AddWalletText = styled(Link)`
  font-size: 16px;
  font-weight: 400;
`;

const KeySettings = () => {
  const {t} = useTranslation();
  const {
    params: {key, context},
  } = useRoute<RouteProp<WalletStackParamList, 'KeySettings'>>();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const {defaultAltCurrency, hideAllBalances} = useAppSelector(({APP}) => APP);
  const {rates} = useAppSelector(({RATE}) => RATE);

  const _wallets = key.wallets;
  const coins = _wallets.filter(wallet => !wallet.credentials.token);
  const tokens = _wallets.filter(wallet => wallet.credentials.token);
  const wallets = buildNestedWalletList(
    coins,
    tokens,
    defaultAltCurrency.isoCode,
    rates,
    dispatch,
  );

  const _key: Key = useAppSelector(({WALLET}) => WALLET.keys[key.id]);
  const {keyName} = _key || {};

  useEffect(() => {
    if (context === 'createEncryptPassword') {
      navigation.navigate('Wallet', {
        screen: 'CreateEncryptPassword',
        params: {key},
      });
    }
  }, [context, key, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle>{t('Key Settings')}</HeaderTitle>,
    });
  });

  const buildEncryptModalConfig = (
    cta: (decryptedKey: {
      mnemonic: string;
      mnemonicHasPassphrase: boolean;
      xPrivKey: string;
    }) => void,
  ) => {
    return {
      onSubmitHandler: async (encryptPassword: string) => {
        try {
          const decryptedKey = key.methods!.get(encryptPassword);
          dispatch(AppActions.dismissDecryptPasswordModal());
          await sleep(300);
          cta(decryptedKey);
        } catch (e) {
          console.log(`Decrypt Error: ${e}`);
          await dispatch(AppActions.dismissDecryptPasswordModal());
          await sleep(500); // Wait to close Decrypt Password modal
          dispatch(showBottomNotificationModal(WrongPasswordError()));
        }
      },
      description: t('To continue please enter your encryption password.'),
      onCancelHandler: () => null,
    };
  };

  const _tokenOptions = useAppSelector(({WALLET}: RootState) => {
    return {
      ...BitpaySupportedTokenOpts,
      ...WALLET.tokenOptions,
      ...WALLET.customTokenOptions,
    };
  });

  const startSyncWallets = async (mnemonic: string) => {
    if (_key.isPrivKeyEncrypted) {
      // To close decrypt modal
      await sleep(500);
    }
    await dispatch(startOnGoingProcessModal('SYNCING_WALLETS'));
    const opts = {
      words: normalizeMnemonic(mnemonic),
      mnemonic,
    };
    try {
      let {key: _syncKey, wallets: _syncWallets} = await serverAssistedImport(
        opts,
      );

      if (_syncKey.fingerPrint === key.properties!.fingerPrint) {
        // Filter for new wallets
        _syncWallets = _syncWallets
          .filter(
            sw =>
              sw.isComplete() &&
              !_key.wallets.some(ew => ew.id === sw.credentials.walletId),
          )
          .map(syncWallet => {
            // update to keyId
            syncWallet.credentials.keyId = key.properties!.id;
            const {currencyAbbreviation, currencyName} = dispatch(
              mapAbbreviationAndName(
                syncWallet.credentials.coin,
                syncWallet.credentials.chain,
              ),
            );
            return merge(
              syncWallet,
              buildWalletObj(
                {...syncWallet.credentials, currencyAbbreviation, currencyName},
                _tokenOptions,
              ),
            );
          });

        let message;

        const syncWalletsLength = _syncWallets.length;
        if (syncWalletsLength) {
          message =
            syncWalletsLength === 1
              ? t('New wallet found')
              : t('wallets found', {syncWalletsLength});
          dispatch(syncWallets({keyId: _key.id, wallets: _syncWallets}));
        } else {
          message = t('Your key is already synced');
        }

        dispatch(dismissOnGoingProcessModal());
        await sleep(500);
        dispatch(
          showBottomNotificationModal({
            type: 'error',
            title: t('Sync wallet'),
            message,
            enableBackdropDismiss: true,
            actions: [
              {
                text: t('OK'),
                action: () => {},
                primary: true,
              },
            ],
          }),
        );
      } else {
        dispatch(dismissOnGoingProcessModal());
        await sleep(500);
        await dispatch(
          showBottomNotificationModal(
            CustomErrorMessage({
              errMsg: t('Failed to Sync wallets'),
            }),
          ),
        );
      }
    } catch (e) {
      dispatch(dismissOnGoingProcessModal());
      await sleep(500);
      await dispatch(
        showBottomNotificationModal(
          CustomErrorMessage({
            errMsg: BWCErrorMessage(e),
            title: t('Error'),
          }),
        ),
      );
    }
  };

  return (
    <WalletSettingsContainer>
      <ScrollContainer>
        <WalletNameContainer
          activeOpacity={ActiveOpacity}
          onPress={() => {
            navigation.navigate('Wallet', {
              screen: 'UpdateKeyOrWalletName',
              params: {key, context: 'key'},
            });
          }}>
          <View>
            <Title>{t('Key Name')}</Title>
            <WalletSettingsTitle>{keyName}</WalletSettingsTitle>
          </View>

          <ChevronRightSvg height={16} />
        </WalletNameContainer>
        <Hr />

        <SettingView>
          <WalletSettingsTitle>{t('Hide All Balances')}</WalletSettingsTitle>

          <ToggleSwitch
            onChange={value => dispatch(toggleHideAllBalances(value))}
            isEnabled={!!hideAllBalances}
          />
        </SettingView>

        <Hr />

        <WalletHeaderContainer>
          <Title>{t('Wallets')}</Title>
        </WalletHeaderContainer>

        {wallets.map(
          ({
            id,
            currencyName,
            chain,
            img,
            badgeImg,
            isToken,
            network,
            hideWallet,
            walletName,
          }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Wallet', {
                  screen: 'WalletSettings',
                  params: {walletId: id, key},
                });
              }}
              key={id}
              activeOpacity={ActiveOpacity}>
              <WalletSettingsRow
                id={id}
                img={img}
                badgeImg={badgeImg}
                currencyName={currencyName}
                chain={chain}
                key={id}
                isToken={isToken}
                network={network}
                hideWallet={hideWallet}
                walletName={walletName}
              />
            </TouchableOpacity>
          ),
        )}

        {_key && !_key.isReadOnly ? (
          <VerticalPadding style={{alignItems: 'center'}}>
            <AddWalletText
              onPress={() => {
                navigation.navigate('Wallet', {
                  screen: 'AddingOptions',
                  params: {key},
                });
              }}>
              {t('Add Wallet')}
            </AddWalletText>
          </VerticalPadding>
        ) : null}

        {_key && !_key.isReadOnly ? (
          <VerticalPadding>
            <Title>{t('Security')}</Title>
            <Setting
              onPress={() => {
                if (!_key.isPrivKeyEncrypted) {
                  navigation.navigate('Wallet', {
                    screen: 'RecoveryPhrase',
                    params: {
                      keyId: key.id,
                      words: getMnemonic(_key),
                      walletTermsAccepted: true,
                      context: 'keySettings',
                      key,
                    },
                  });
                } else {
                  dispatch(
                    AppActions.showDecryptPasswordModal(
                      buildEncryptModalConfig(async ({mnemonic}) => {
                        navigation.navigate('Wallet', {
                          screen: 'RecoveryPhrase',
                          params: {
                            keyId: key.id,
                            words: mnemonic.trim().split(' '),
                            walletTermsAccepted: true,
                            context: 'keySettings',
                            key,
                          },
                        });
                      }),
                    ),
                  );
                }
              }}>
              <WalletSettingsTitle>{t('Backup')}</WalletSettingsTitle>
            </Setting>

            <Hr />

            <SettingView>
              <WalletSettingsTitle>
                {t('Request Encrypt Password')}
              </WalletSettingsTitle>

              <RequestEncryptPasswordToggle currentKey={_key} />
            </SettingView>

            <Info>
              <InfoTriangle />

              <InfoHeader>
                <InfoImageContainer infoMargin={'0 8px 0 0'}>
                  <InfoSvg />
                </InfoImageContainer>

                <InfoTitle>{t('Password Not Recoverable')}</InfoTitle>
              </InfoHeader>
              <InfoDescription>
                {t(
                  'This password cannot be recovered. If this password is lost, funds can only be recovered by reimporting your 12-word recovery phrase.',
                )}
              </InfoDescription>

              <VerticalPadding>
                <TouchableOpacity
                  activeOpacity={ActiveOpacity}
                  onPress={() => {
                    dispatch(
                      openUrlWithInAppBrowser(URL.HELP_SPENDING_PASSWORD),
                    );
                  }}>
                  <Link>{t('Learn More')}</Link>
                </TouchableOpacity>
              </VerticalPadding>
            </Info>

            <Hr />

            {_key?.methods?.isPrivKeyEncrypted() ? (
              <>
                <SettingView>
                  <Setting
                    activeOpacity={ActiveOpacity}
                    onPress={() => {
                      navigation.navigate('Wallet', {
                        screen: 'ClearEncryptPassword',
                        params: {keyId: key.id},
                      });
                    }}>
                    <WalletSettingsTitle>
                      {t('Clear Encrypt Password')}
                    </WalletSettingsTitle>
                  </Setting>
                </SettingView>
                <Hr />
              </>
            ) : null}
          </VerticalPadding>
        ) : null}

        <VerticalPadding>
          <Title>{t('Advanced')}</Title>
          {_key && !_key.isReadOnly ? (
            <>
              <Setting
                activeOpacity={ActiveOpacity}
                onPress={() => {
                  if (!_key.isPrivKeyEncrypted) {
                    startSyncWallets(_key.properties!.mnemonic);
                  } else {
                    dispatch(
                      AppActions.showDecryptPasswordModal(
                        buildEncryptModalConfig(async ({mnemonic}) => {
                          startSyncWallets(mnemonic);
                        }),
                      ),
                    );
                  }
                }}>
                <WalletSettingsTitle>
                  {t('Sync Wallets Across Devices')}
                </WalletSettingsTitle>
              </Setting>
              <Hr />
            </>
          ) : null}

          {_key && !_key.isReadOnly ? (
            <>
              <Setting
                activeOpacity={ActiveOpacity}
                onPress={() => {
                  if (!_key.isPrivKeyEncrypted) {
                    navigation.navigate('Wallet', {
                      screen: 'ExportKey',
                      params: {
                        code: generateKeyExportCode(
                          _key,
                          _key.properties!.mnemonic,
                        ),
                        keyName,
                      },
                    });
                  } else {
                    dispatch(
                      AppActions.showDecryptPasswordModal(
                        buildEncryptModalConfig(async ({mnemonic}) => {
                          const code = generateKeyExportCode(key, mnemonic);
                          navigation.navigate('Wallet', {
                            screen: 'ExportKey',
                            params: {code, keyName},
                          });
                        }),
                      ),
                    );
                  }
                }}>
                <WalletSettingsTitle>{t('Export Key')}</WalletSettingsTitle>
              </Setting>

              <Hr />
            </>
          ) : null}

          {_key && !_key.isReadOnly ? (
            <>
              <Setting
                activeOpacity={ActiveOpacity}
                onPress={() => {
                  if (!_key.isPrivKeyEncrypted) {
                    navigation.navigate('Wallet', {
                      screen: 'ExtendedPrivateKey',
                      params: {
                        xPrivKey: _key.properties!.xPrivKey,
                      },
                    });
                  } else {
                    dispatch(
                      AppActions.showDecryptPasswordModal(
                        buildEncryptModalConfig(async ({xPrivKey}) => {
                          navigation.navigate('Wallet', {
                            screen: 'ExtendedPrivateKey',
                            params: {xPrivKey},
                          });
                        }),
                      ),
                    );
                  }
                }}>
                <WalletSettingsTitle>
                  {t('Extended Private Key')}
                </WalletSettingsTitle>
              </Setting>

              <Hr />
            </>
          ) : null}

          <Setting
            activeOpacity={ActiveOpacity}
            style={{marginBottom: 50}}
            onPress={() => {
              navigation.navigate('Wallet', {
                screen: 'DeleteKey',
                params: {keyId: key.id},
              });
            }}>
            <WalletSettingsTitle>{t('Delete')}</WalletSettingsTitle>
          </Setting>
        </VerticalPadding>
      </ScrollContainer>
    </WalletSettingsContainer>
  );
};

export default KeySettings;
