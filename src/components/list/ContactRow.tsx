import React, {memo} from 'react';
import styled from 'styled-components/native';
import {useTheme} from 'styled-components/native';
import {Column, ScreenGutter} from '../styled/Containers';
import {H5, ListItemSubText} from '../styled/Text';
import AngleRight from '../../../assets/img/angle-right.svg';
import ContactIcon from '../../navigation/tabs/contacts/components/ContactIcon';
import {getCurrencyAbbreviation} from '../../utils/helper-methods';

const ContactContainer = styled.TouchableOpacity`
  padding: 10px 0px;
  cursor: pointer;
`;

const ContactColumn = styled(Column)`
  margin-left: 24px;
  margin-right: 8px;
`;

const ContactImageContainer = styled.View`
  height: 35px;
  width: 35px;
  display: flex;
  justify-content: center;
  align-self: center;
  border-radius: 8px;
`;

const RowContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 8px 0;
`;

export interface ContactRowProps {
  address: string;
  coin: string;
  chain: string;
  network: string;
  name: string;
  tag?: number; // backward compatibility
  destinationTag?: number;
  email?: string;
}

interface Props {
  contact: ContactRowProps;
  onPress: () => void;
}

const ContactRow = ({contact, onPress}: Props) => {
  const theme = useTheme();
  const underlayColor = theme.dark ? '#121212' : '#fbfbff';
  const {coin: _coin, name, email, address, chain} = contact;
  const coin = getCurrencyAbbreviation(_coin, chain);
  return (
    <ContactContainer underlayColor={underlayColor} onPress={onPress}>
      <RowContainer>
        <ContactImageContainer>
          <ContactIcon name={name} coin={coin} size={45} chain={chain} />
        </ContactImageContainer>
        <ContactColumn>
          <H5>{name}</H5>
          <ListItemSubText numberOfLines={1} ellipsizeMode={'tail'}>
            {email ? email : address}
          </ListItemSubText>
        </ContactColumn>
      </RowContainer>
    </ContactContainer>
  );
};

export default memo(ContactRow);
