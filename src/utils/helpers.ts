import { cryptography } from '@klayr/client';

export const waitTimeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getKlayer32FromPublic = (publicKey: string): string => {
  return cryptography.address.getKlayr32AddressFromPublicKey(Buffer.from(publicKey, 'hex'));
};

export const getKlayer32Address = (address: string): string => {
  return cryptography.address.getKlayr32AddressFromAddress(Buffer.from(address, 'hex'));
};
