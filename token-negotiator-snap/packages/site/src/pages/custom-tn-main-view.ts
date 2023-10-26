import React from 'react';
import { AbstractView } from "@tokenscript/token-negotiator";
import {
  sendAddGoerliCollection
} from '../utils';

export class CustomMainView extends AbstractView {
  constructor(client: any, popup: any, viewContainer: any, params: any) {
    super(client, popup, viewContainer, params);
  }

  handleAddGoerliCollectionClick = async () => {
    try {
      const contractAdress = await sendAddGoerliCollection();

      console.log('contract address found: ', contractAdress);

      let issuers = this.client.config.issuers;

      if (!issuers) issuers = [];

      issuers.push({
        onChain: true,
        blockchain: "evm",
        chain: "goerli",
        collectionID: btoa(contractAdress),
        contract: contractAdress
      });

      // @ts-ignore
      this.client.negotiate(issuers).then(() => {
        this.autoLoadTokens(true);
      })

    } catch (e) {
      console.error(e);
    }
  };

  async autoLoadTokens(refresh = false) {
    await this.client.tokenAutoLoad(
      () => { },
      () => { },
      refresh,
    )
  }

  init() {
    if (this.client.getTokenStore().hasUnloadedTokens()) {
      this.client.enrichTokenLookupDataOnChainTokens()
      this.autoLoadTokens()
    }
  }

  renderContents() {
    this.viewContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-around">
        <div style="display: flex; align-items: center;"><svg style="width: 50px; height: 50px; margin: 30px" width="36" height="36" viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 53 26"><path fill="currentColor" d="M52.9924 0.955933H28.0025V25.9639H52.9924V0.955933Z"></path><path fill="currentColor" d="M0.508545 0.956909V5.97799C5.80557 5.97799 10.8856 8.08377 14.6312 11.832C18.3767 15.5803 20.481 20.664 20.481 25.9649H25.4985V0.956909H0.508545Z"></path></svg></svg> + Meta Mask Snaps</div>
        <button style="margin: 35px;">Add Goerli EVM Collection</button>
      </div>
    `
    this.viewContainer.querySelector('button').addEventListener('click', this.handleAddGoerliCollectionClick);
  }

  public render() {
    this.client.negotiatorConnectToWallet('MetaMask').then(() => {
      this.init();
      this.renderContents();
    }, () => {
      console.log('please connect your wallet and try again');
    });
  }
}


// Work around to an issue with version of Gatsby - requirement to export a react component.
class DummyComponent extends React.Component {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (`
      <div></div>
    `);
  }
}

export default DummyComponent;

