import React, { useState, useEffect } from "react";
import {
  Container,
  Content,
  Title,
  ContainedText,
  DisconnectedIllustration,
  ErrorIllustration,
} from "./styles";
import Loading from "~components/Loading";
import Button from "~components/Button";
import NetInfo from "@react-native-community/netinfo";
import ErrorBoundary from "react-native-error-boundary";
import { useNavigation } from "@react-navigation/native";
import { SceneName } from "~src/@types/SceneName";
import RNRestart from 'react-native-restart';


export const OfflineComponent = ({ refetch }: { refetch: () => void }) => {
  return (
    <Container>
      <Content>
        <DisconnectedIllustration />
        <Title>Network Error</Title>
        <ContainedText>
          It seems you are offline
        </ContainedText>
        <Button onPress={() => refetch()}>Retry</Button>
      </Content>
    </Container>
  );
};

export const RequestErrorComponent = ({ refetch }: { refetch: () => void }) => {

  const navigation = useNavigation();

  const handleRestart = () => {
  };

  return (
    <Container>
      <Content>
        <ErrorIllustration />
        <Title>Something went wrong</Title>
        <ContainedText>
          We are trying to find your next matches
        </ContainedText>
        <Button style={{marginTop : 20}} onPress={handleRestart}>Reload</Button>
        <Button style={{marginTop : 50, backgroundColor : 'gray', borderColor : 'white'}} onPress={() => navigation.navigate(SceneName.EditProfile)}>Go to Profile</Button>
      </Content>
    </Container>
  );
};

export const UnknownErrorComponent = () => {
  return (
    <Container>
      <Content>
        <ErrorIllustration />
        <Title>Something went wrong</Title>
        <ContainedText>Try again</ContainedText>
        <Button>Reload</Button>
      </Content>
    </Container>
  );
};

// NetInfo is always disconnected on the first render. Workaround hook
export function useIsOffline() {
  const [netInfo, setNetInfo] = useState({
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(setNetInfo);
    return unsubscribe;
  }, []);

  return !netInfo.isInternetReachable;
}

interface SafeComponentProps {
  request?: { data?: any; error?: any; loading?: boolean };
  refetch?: () => void;
  children: any;
}

export default function SafeComponent({
  request,
  children,
  refetch,
}: SafeComponentProps) {
  const offline = useIsOffline();

  const SafeChildren = (
    <ErrorBoundary FallbackComponent={UnknownErrorComponent}>
      {children || null}
    </ErrorBoundary>
  );

  if (request?.loading)
    return (
      <Content>
        <Loading />
      </Content>
    );

  if (request?.data) return SafeChildren;
  if (request && offline) return <OfflineComponent refetch={refetch} />;
  if (request?.error) return <RequestErrorComponent refetch={refetch} />;

  return SafeChildren;
}
