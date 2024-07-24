import { cryptography } from '@klayr/client';

export const waitTimeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getKlayr32AddressFromPublicKey = (publicKey: string): string => {
  return cryptography.address.getKlayr32AddressFromPublicKey(Buffer.from(publicKey, 'hex'));
};

export const getKlayr32AddressFromAddress = (address: string): string => {
  return cryptography.address.getKlayr32AddressFromAddress(Buffer.from(address, 'hex'));
};

export const getAddressFromKlayr32Address = (klayr32: string): Buffer => {
  return cryptography.address.getAddressFromKlayr32Address(klayr32, 'kly');
};
