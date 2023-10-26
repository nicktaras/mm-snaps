// @ts-nocheck
import { useContext, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  isLocalSnap,
  userConfirmTokenNegotiatorConnection,
  sendDeclined,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  ConnectToTokenNegotiatorButton,
  Card,
  MediaCard
} from '../components';
import { defaultSnapOrigin } from '../config';
import { Client } from "@tokenscript/token-negotiator";
import { CustomMainView } from "./custom-tn-main-view";
import "./custom-tn-theme.css";
import abi from './abis/erc721-abi.json';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [tokenImages, setTokenImages] = useState([]);
  const [declined, setDeclined] = useState(false);
  const [acceptedTKNConnection, setAcceptedTKNConnection] = useState(false);
  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? state.isFlask
    : state.snapsDetected;
 
  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const mint = async () => {

    try {
    const provider = new _ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new _ethers.Contract('0xc361201E5B1005cCDE47B32F223BC145DE393F62', abi, signer);
    const tx = await contract.safeMint('0x96B40b641601CdD7B468C8fE90217B922209cA82', '');
    // await tx.wait();
    } catch (err) {
      setDeclined(true)
      return true;
    }
    
  }

  const initialiseTokenNegotiatorClick = async () => {
    try {
      const userSelection = await userConfirmTokenNegotiatorConnection();
      if(userSelection === true) {
        // @ts-ignore
        window.negotiator = new Client({
          type: "active",
          issuers: [
            {
              onChain: true,
              blockchain: "evm",
              chain: "goerli",
              collectionID: "test",
              contract: "0xc361201E5B1005cCDE47B32F223BC145DE393F62",
            }
          ],
          uiOptions: {
            uiType: "inline",
            openingHeading: "Connect your NFT to access custom content and more.",
            issuerHeading: "Your Off Chain Attestations",
            alwaysShowStartScreen: true,
            repeatAction: "try again",
            theme: "light",
            position: "bottom-right",
            viewOverrides: {
              "start": {
                component: CustomMainView,
                options: {
                  viewTransition: "slide-in-bottom"
                }
              }
            }
          },
        });
        negotiator.negotiate();
        negotiator.on("tokens-selected", (tokenIssuers) => {
          let issuerKeys = Object.keys(tokenIssuers.selectedTokens);
          let _tokenImages:[] = [];
          if(issuerKeys.length > 0) {
            issuerKeys.forEach((key) => {
              tokenIssuers.selectedTokens[key].tokens.forEach((token) => {
                // @ts-ignore
                if(token?.image) {
                  // @ts-ignore
                  _tokenImages.push(token?.image);
                }
              });
            });
          }
          updateTokenImages(_tokenImages);
        });
        setAcceptedTKNConnection(true);
      } else {
        sendDeclined();
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const updateTokenImages = (_tokenImages:[]) => {
    setTokenImages(_tokenImages);
  }
  
  return (
    <Container>
      <Heading>
        <Span>token-negotiator-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!isMetaMaskReady}
                />
              ),
            }}
            disabled={!isMetaMaskReady}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: "Let's get started!",
            description:
              `Initialise Token Negotiator to add your Goerli NFT collections via Snaps.`,
            button: (
              <ConnectToTokenNegotiatorButton
                onClick={initialiseTokenNegotiatorClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />

        <div className="overlay-tn"></div>

        { acceptedTKNConnection &&
          <div style={{ width: '100%' }}>
            <MediaCard>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <p style={{ textAlign: 'center', margin: "20px" }}>Special Edition WoW Smart Token</p>
                <button style={{ height: 'fit-content', borderRadius: '8px', width: '110px' }} onClick={() => { mint() }}>Mint</button>
                <div>
                  { declined ? <p>user declined transaction</p> : '' }
                </div> 
              </div>
            </MediaCard>
          </div>
        }
                
        { tokenImages.length > 0 &&
          <div style={{ width: '100%' }}>
            <p style={{ textAlign: 'center', margin: '24px 0 18px 0' }}>Your Goerli NFT's</p>
            <MediaCard>
              {tokenImages && tokenImages.map((image, index) => (
                <div className='card' key={index}>
                  <img src={image} alt={`Image ${index}`} />
                </div>
              ))}
            </MediaCard>
          </div>
        }
        
      </CardContainer>

      <p>Demo addresses: </p>

      <p>0xc361201E5B1005cCDE47B32F223BC145DE393F62</p>
      <p>0x87644E0A1287A4D96DecC29A13400a1be9759AF8</p>
      <p>0xae96095fF42B0Cae2DaD3d49E5EE11663280d819</p>
      <p></p>

    </Container>
  );
};

export default Index;
