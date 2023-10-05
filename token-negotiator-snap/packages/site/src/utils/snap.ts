import { MetaMaskInpageProvider } from '@metamask/providers';
import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';
import { isValidEthereumAddress } from '../utils';


// import { Client } from "@tokenscript/token-negotiator";
// import "@tokenscript/token-negotiator/dist/theme/style.css";

// // configuration

// const negotiator = new Client({
//   type: "active",
//   issuers: [
//     {
//       blockchain: "evm",
//       onChain: true,
//       collectionID: "expansion-punks",
//       contract: "0x0d0167a823c6619d430b1a96ad85b888bcf97c37",
//       chain: "eth",
//     }
//   ],
//   uiOptions: {
//     openingHeading: "Connect your NFT to access custom content and more.",
//     issuerHeading: "Get discount with token",
//     repeatAction: "try again",
//     theme: "light",
//     position: "bottom-right",
//   },
// });

// // invoke

// negotiator.negotiate();

// // event hooks

// negotiator.on("tokens-selected", (tokens) => {
//   console.log('owner tokens', tokens);
// });

/**
 * Get the installed snaps in MetaMask.
 *
 * @param provider - The MetaMask inpage provider.
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (
  provider?: MetaMaskInpageProvider,
): Promise<GetSnapsResponse> =>
  (await (provider ?? window.ethereum).request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

export const userConfirmTokenNegotiatorConnection = async () => {
  const output = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: defaultSnapOrigin, request: { method: 'connect-token-negotiator' } },
  });
  return output;
};

export const sendAddGoerliCollection = async () => {
  const output = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: defaultSnapOrigin, request: { method: 'add-goerli-evm-collection' } },
  });
  const isValid = isValidEthereumAddress(output);
  if (!isValid) throw new Error('Invalid Ethereum address');
  return output;
};

export const sendDeclined = async () => {
  const output = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: defaultSnapOrigin, request: { method: 'user-declined-access-token-negotiator' } },
  });
  return output;
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
