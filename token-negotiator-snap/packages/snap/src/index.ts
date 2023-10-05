import { OnRpcRequestHandler, OnCronjobHandler, OnTransactionHandler } from '@metamask/snaps-types';
import { divider, panel, text } from '@metamask/snaps-ui';

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
            text(`Token Negotiator, **${origin}**!`),
            divider(),
            text('Do you allow connection all tokens from inside this wallet to this website?'),
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
