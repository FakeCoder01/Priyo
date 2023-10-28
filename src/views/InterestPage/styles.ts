import styled, { css } from "styled-components/native";
import { Button } from "~components";
import { width } from "~constants";

export const containerPadding = 15;
export const numOfColumns = 3;
export const userPictureHeight = 159;
export const userPictureWidth = (width - containerPadding * 2) / numOfColumns;

export const Container = styled.ScrollView`
  flex-grow: 1;
`;

export const ContinueButton = styled(Button)`
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
  border-width: 0px;
  border-top-width: 1px;
  border-color: ${(props) => props.theme.colors.background};

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.5;
    `}
`;

interface BottomPaddingProps {
  disabled?: boolean;
}

export const BottomPadding = styled.View<BottomPaddingProps>`
  background-color: ${(props) => props.theme.colors.primary};

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.5;
    `}
`;
