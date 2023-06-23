import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store';
import styled from 'styled-components/native';
import {AppActions} from '../../../store/app';
import {ActionContainer} from '../../../components/styled/Containers';
import {LightBlack, White} from '../../../styles/colors';
import yup from '../../../lib/yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {Controller, useForm} from 'react-hook-form';
import BoxInput from '../../../components/form/BoxInput';
import Button from '../../../components/button/Button';
import {HeaderTitle, Paragraph} from '../../../components/styled/Text';
import {Keyboard} from 'react-native';
import {sleep} from '../../../utils/helper-methods';
import {useTranslation} from 'react-i18next';
import SheetModal from '../../../components/modal/base/sheet/SheetModal';
import {useAppDispatch} from '../../../utils/hooks';

const DecryptFormContainer = styled.View`
  background: ${({theme: {dark}}) => (dark ? LightBlack : White)};
  padding: 25px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  max-height: 500px;
`;

const schema = yup.object().shape({
  password: yup.string().required(),
});

const PasswordFormContainer = styled.View`
  margin: 15px 0;
`;

const PasswordInputContainer = styled.View`
  margin: 15px 0;
`;

const PasswordFormDescription = styled(Paragraph)`
  color: ${({theme}) => theme.colors.text};
  margin: 10px 0;
`;

interface DecryptPasswordFieldValues {
  password: string;
}

export interface DecryptPasswordConfig {
  onSubmitHandler: (data: string) => void;
  onCancelHandler?: () => void;
  description?: string;
}

const DecryptEnterPasswordModal = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const isVisible = useSelector(
    ({APP}: RootState) => APP.showDecryptPasswordModal,
  );
  const decryptPasswordConfig = useSelector(
    ({APP}: RootState) => APP.decryptPasswordConfig,
  );

  const {onSubmitHandler, onCancelHandler, description} =
    decryptPasswordConfig || {};

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<DecryptPasswordFieldValues>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!isVisible) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const dismissModal = () => {
    dispatch(AppActions.dismissDecryptPasswordModal());
    setTimeout(() => {
      dispatch(AppActions.resetDecryptPasswordConfig());
    }, 500); // Wait for modal to close
    onCancelHandler && onCancelHandler();
  };

  const onSubmit = async ({password}: {password: string}) => {
    Keyboard.dismiss();
    await sleep(0);
    onSubmitHandler && onSubmitHandler(password);
  };

  return (
    <SheetModal
      isVisible={isVisible}
      placement={'bottom'}
      onBackdropPress={dismissModal}>
      <DecryptFormContainer>
        <PasswordFormContainer>
          <HeaderTitle>{t('Enter encryption password')}</HeaderTitle>

          {description ? (
            <PasswordFormDescription>{description}</PasswordFormDescription>
          ) : null}
          <PasswordInputContainer>
            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <BoxInput
                  label={'ENCRYPTION PASSWORD'}
                  type={'password'}
                  onBlur={onBlur}
                  onChangeText={(text: string) => onChange(text)}
                  error={errors.password?.message}
                  value={value}
                />
              )}
              name="password"
              defaultValue=""
            />
          </PasswordInputContainer>

          <ActionContainer>
            <Button onPress={handleSubmit(onSubmit)}>{t('Continue')}</Button>
          </ActionContainer>
          <ActionContainer>
            <Button onPress={dismissModal} buttonStyle={'secondary'}>
              {t('Cancel')}
            </Button>
          </ActionContainer>
        </PasswordFormContainer>
      </DecryptFormContainer>
    </SheetModal>
  );
};

export default DecryptEnterPasswordModal;
