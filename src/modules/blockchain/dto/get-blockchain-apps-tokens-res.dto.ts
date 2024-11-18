import { ApiResponseOptions } from '@nestjs/swagger';

class TokenLogo {
  png: string;
  svg: string;
  tokenID: string;
}

class DenomUnit {
  denom: string;
  decimals: number;
  aliases: string[];
  tokenID: string;
}

export class GetTokensMetaData {
  chainName: string;
  networkType: string;
  tokenID: string;
  chainID: string;
  tokenName: string;
  description: string;
  symbol: string;
  displayDenom: string;
  baseDenom: string;
  logo?: TokenLogo;
  denomUnits: DenomUnit[];
}

export class GetTokensMetaMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetTokensMetaResDto {
  data: GetTokensMetaData[];
  meta: GetTokensMetaMeta;
}

export const getTokensMetaResponse: ApiResponseOptions = {
  status: 200,
  description: 'Tokens meta data have been successfully retrieved.',
  type: GetTokensMetaResDto,
};
