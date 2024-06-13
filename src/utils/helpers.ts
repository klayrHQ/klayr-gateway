import { cryptography } from '@klayr/client';

export const waitTimeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getKlayer32Address = (publicKey: string): string => {
  return cryptography.address.getKlayr32AddressFromPublicKey(Buffer.from(publicKey, 'hex'));
};
