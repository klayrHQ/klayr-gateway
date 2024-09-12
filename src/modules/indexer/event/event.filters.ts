import { ChainEvent } from '../interfaces/chain-event.interface';
import { PosValidatorStaked } from './types';

export interface FilterParams {
  event: ChainEvent;
  type: string;
  seenAddresses: Set<string>;
}

export function filterValidatorStaked({ event, type, seenAddresses }: FilterParams): boolean {
  const { senderAddress } = JSON.parse(event.data as string) as PosValidatorStaked;
  const senderEventPair = `${type}:${senderAddress}`;

  if (seenAddresses.has(senderEventPair)) return false;

  seenAddresses.add(senderEventPair);
  return true;
}

export function alwaysTrue(_: FilterParams): boolean {
  return true;
}
