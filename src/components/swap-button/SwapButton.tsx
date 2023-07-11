import React, {useState} from 'react';
import styled from 'styled-components/native';
import {BaseText} from '../styled/Text';
import {LightBlack, NotificationPrimary, White} from '../../styles/colors';
import SwapHorizontal from '../icons/swap-horizontal/SwapHorizontal';

export const SwapButtonContainer = styled.TouchableOpacity`
  position: absolute;
  right: 0;
  bottom: 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 90px;
  background-color: ${({theme: {dark}}) => (dark ? LightBlack : '#edf1fe')};
  height: 39px;
  border-radius: 19.09px;
  cursor: pointer;
`;

export const ButtonText = styled(BaseText)`
  margin-left: 10px;
  font-size: 18px;
  font-weight: 500;
  top: 2px;
  color: ${({theme: {dark}}) => (dark ? White : NotificationPrimary)};
`;

export interface SwapButtonProps {
  swapList: Array<string>;
  onChange: (val: string) => void;
}

const SwapButton = ({swapList, onChange}: SwapButtonProps) => {
  const initText = swapList[0];
  const [text, setText] = useState(initText);

  const swapText = (val: string) => {
    if (swapList.length === 1) {
      return;
    }
    const curVal = val === swapList[0] ? swapList[1] : swapList[0];
    setText(curVal);
    onChange(curVal);
  };

  return (
    <SwapButtonContainer onPress={() => swapText(text)}>
        <SwapHorizontal />
        <ButtonText>{text}</ButtonText>
    </SwapButtonContainer>
  );
};

export default SwapButton;
