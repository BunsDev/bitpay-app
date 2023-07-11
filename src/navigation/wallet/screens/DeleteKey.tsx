import React, {useLayoutEffect, useState} from 'react';
import {HeaderTitle, H5, Paragraph} from '../../../components/styled/Text';
import {useNavigation, useRoute} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/core';
import {WalletStackParamList} from '../WalletStack';
import styled from 'styled-components/native';
import {ScreenGutter} from '../../../components/styled/Containers';
import Button from '../../../components/button/Button';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import {startOnGoingProcessModal} from '../../../store/app/app.effects';
import {AppActions} from '../../../store/app';
import {
  deleteKey,
  updatePortfolioBalance,
} from '../../../store/wallet/wallet.actions';
import useAppSelector from '../../../utils/hooks/useAppSelector';
import {useTranslation} from 'react-i18next';
import {useAppDispatch} from '../../../utils/hooks';

const DeleteKeyContainer = styled.SafeAreaView`
  flex: 1;
`;

const ScrollView = styled.ScrollView`
  padding: 0px 8px;
  margin-left: ${ScreenGutter};
`;

const Title = styled(H5)`
  color: #ce334b;
`;

const DeleteKeyParagraph = styled(Paragraph)`
  margin: 15px 0 20px;
`;

const DeleteKey = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const {keys} = useAppSelector(({WALLET}) => WALLET);

  const {
    params: {keyId},
  } = useRoute<RouteProp<WalletStackParamList, 'DeleteKey'>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle>{t('Delete Key')}</HeaderTitle>,
    });
  });

  const [isVisible, setIsVisible] = useState(false);
  const startDeleteKey = async () => {
    setIsVisible(false);
    await dispatch(startOnGoingProcessModal('DELETING_KEY'));

    const previousKeysLength = Object.keys(keys).length;
    const numNewKeys = Object.keys(keys).length - 1;
    const lengthChange = previousKeysLength - numNewKeys;
    dispatch(deleteKey({keyId, lengthChange}));

    dispatch(updatePortfolioBalance());
    dispatch(AppActions.dismissOnGoingProcessModal());
    navigation.navigate('Tabs', {screen: 'Home'});
  };

  return (
    <DeleteKeyContainer>
      <ScrollView>
        <Title>{t('Warning!')}</Title>
        <DeleteKeyParagraph>
          {t(
            'Permanently deletes all wallets using this key. \nTHIS ACTION CANNOT BE REVERSED.',
          )}
        </DeleteKeyParagraph>

        <Button onPress={() => setIsVisible(true)}>{t('Delete')}</Button>
      </ScrollView>

      <DeleteConfirmationModal
        description={t(
          'Are you sure you want to delete all wallets using this key?',
        )}
        onPressOk={startDeleteKey}
        isVisible={isVisible}
        onPressCancel={() => setIsVisible(false)}
      />
    </DeleteKeyContainer>
  );
};

export default DeleteKey;
