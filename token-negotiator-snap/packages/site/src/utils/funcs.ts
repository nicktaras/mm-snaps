export const isValidEthereumAddress = (address: string) => {
  // Check if the address is a non-empty string
  if (typeof address !== 'string' || address.length === 0) {
    return false;
  }
  // Check if the address matches the Ethereum address format
  const ethereumAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
  return ethereumAddressRegex.test(address);
}