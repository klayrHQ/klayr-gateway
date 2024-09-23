import { ChainEvent } from '../interfaces/chain-event.interface';
import { TokenLockEvent, TokenTransferEvent } from '../interfaces/token-events.interface';
import { PosValidatorStaked } from './types';

export interface FilterParams {
  event: ChainEvent;
  type: string;
  seenAddresses: Set<string>;
}

enum FilterTypes {
  UPDATE_ACCOUNT = 'updateAccount',
}

export function filterValidatorStaked({ event, type, seenAddresses }: FilterParams): boolean {
  const { senderAddress } = JSON.parse(event.data as string) as PosValidatorStaked;
  const senderEventPair = `${type}:${senderAddress}`;

  return filterHelper(seenAddresses, [senderEventPair]);
}

export function filterTokenTransfer({ event, seenAddresses }: FilterParams): boolean {
  const { senderAddress, recipientAddress } = JSON.parse(
    event.data as string,
  ) as TokenTransferEvent;
  const senderEventPair = `${FilterTypes.UPDATE_ACCOUNT}:${senderAddress}`;
  const recipientEventPair = `${FilterTypes.UPDATE_ACCOUNT}:${recipientAddress}`;

  return filterHelper(seenAddresses, [senderEventPair, recipientEventPair]);
}

export function filterTokenLockUnLockBurnMint({ event, seenAddresses }: FilterParams): boolean {
  const { address } = JSON.parse(event.data as string) as TokenLockEvent;
  const eventPair = `${FilterTypes.UPDATE_ACCOUNT}:${address}`;

  return filterHelper(seenAddresses, [eventPair]);
}

export function alwaysTrue(_: FilterParams): boolean {
  return true;
}

function filterHelper(seenAddresses: Set<string>, addressPairs: string[]): boolean {
  let exists = false;

  addressPairs.forEach((pair) => {
    if (seenAddresses.has(pair)) {
      exists = true;
    } else {
      seenAddresses.add(pair);
    }
  });

  return !exists;
}
