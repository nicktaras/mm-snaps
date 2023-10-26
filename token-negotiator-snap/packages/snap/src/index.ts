
import { OnRpcRequestHandler, OnCronjobHandler, OnTransactionHandler } from '@metamask/snaps-types';
import { heading, divider, panel, text } from '@metamask/snaps-ui';

// Handle outgoing transactions.
export const onTransaction: OnTransactionHandler = async ({ transaction, transactionOrigin, chainId }) => {

  // Use the window.ethereum global provider to fetch the gas price.
  // @ts-ignore
  const currentGasPrice = window.ethereum ? await window.ethereum.request({
    method: 'eth_gasPrice',
  }) : undefined;

  // Get fields from the transaction object.
  const transactionGas = parseInt(transaction.gas as string, 16);
  const currentGasPriceInWei = parseInt(currentGasPrice ?? '', 16);
  const maxFeePerGasInWei = parseInt(transaction.maxFeePerGas as string, 16);
  const maxPriorityFeePerGasInWei = parseInt(
    transaction.maxPriorityFeePerGas as string,
    16,
  );

  // Calculate gas fees the user would pay.
  const gasFees = Math.min(
    maxFeePerGasInWei * transactionGas,
    (currentGasPriceInWei + maxPriorityFeePerGasInWei) * transactionGas,
  );

  // Calculate gas fees as percentage of transaction.
  const transactionValueInWei = parseInt(transaction.value as string, 16);
  const gasFeesPercentage = (gasFees / (gasFees + transactionValueInWei)) * 100;

  // Display percentage of gas fees in the transaction insights UI.
  return {
    content: panel([
      heading('Transaction Insights'),
      text('Purchase of an ERC5169 Smart Token from the WoW Collection'),
      divider(),
      text(
        `Users are required to pay **${gasFeesPercentage.toFixed(
          2,
        )}%** in gas fees for this transaction.`,
      ),
      text(`- ChainID ${chainId}`),
      text(`- Transaction request origin ${transactionOrigin}`),
      divider(),
      text('Token Actions:'),
      text('VIP Access to Sandbox 🚀'),
      text('VIP Access to Wow Chat 💬'),
      text('Level Up with accessories 👗 and skills 🏄‍♀️ with BrandExtender'),
      divider(),
      text('Unleash your Smart Token: https://smartlayer.network/'),
    ]),
  }
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'add-goerli-evm-collection':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: panel([
            text(`Token Negotiator, **${origin}**!`),
            divider(),
            text('Add Goerli EVM Collection Smart Contract Address'),
          ]),
        },
      });
    case 'connect-token-negotiator':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading(`Token Negotiator Connection`),
            text(`Do you allow Token Negotiator to connect with this website **${origin}**!`),
            divider(),
            text(`Allows you to create a gallery from NFT collections and mint a Smart Token.`),
          ]),
        },
      });
    case 'user-declined-access-token-negotiator':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: panel([
            text(`Token Negotiator, **${origin}**!`),
            divider(),
            text('You declined access to your tokens. Please allow access to your tokens to use this website.'),
          ]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
