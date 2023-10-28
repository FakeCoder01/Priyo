import React from "react";
import Animated, { FadeInDown, ZoomOutDown } from "react-native-reanimated";
import {
  Container,
  ActionItem
} from "./styles";

import HeartRightSwipe from "./assets/HeartRightSwipe";
import CancelLeftSwipe from "./assets/CancelLeftSwipe";
import PassUpSwipe from "./assets/PassUpSwipe";

const MatchActionBar = ({
  onNope,
  onYep,
  onMaybe,
  animated,
  ...props
}: any) => {
  return (
    <Container exiting={ZoomOutDown} {...props}>
      <Animated.View entering={animated && FadeInDown.delay(300)}>
        <ActionItem onPress={onNope}>
          <CancelLeftSwipe />
        </ActionItem>
      </Animated.View>
      <Animated.View entering={animated && FadeInDown.delay(350)}>
        <ActionItem onPress={onMaybe}>
          <PassUpSwipe />
        </ActionItem>
      </Animated.View>
      <Animated.View entering={animated && FadeInDown.delay(400)}>
        <ActionItem onPress={onYep}>
          <HeartRightSwipe  />
        </ActionItem>
      </Animated.View>
    </Container>
  );
};

export default MatchActionBar;
