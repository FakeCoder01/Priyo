import React from "react";
import {
  Container,
  RotatedRectangle,
  Title,
  Line,
  UnderlineContainer,
} from "./styles";

export const Underline = ({ children }) => (
  <UnderlineContainer>
    <Line />
    {children}
  </UnderlineContainer>
);

export const RectangleHighLight = ({ children }) => (
  <UnderlineContainer>
    <RotatedRectangle />
    {children}
  </UnderlineContainer>
);

const HeroText: React.FC = () => {
  return (
    <Container>
      <Title>find your </Title>
      <RectangleHighLight>
        <Title style={{ color: "white" }}>love</Title>
      </RectangleHighLight>
      <Title> easily on </Title>
      <RectangleHighLight>
        <Title style={{ color: "white" }}> Priyo </Title>
      </RectangleHighLight>
    </Container>
  );
};

export default HeroText;
