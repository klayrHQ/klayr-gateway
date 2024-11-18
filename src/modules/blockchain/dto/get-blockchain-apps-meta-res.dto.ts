import { ApiResponseOptions } from '@nestjs/swagger';

class ServiceURL {
  http: string;
  ws: string;
  apiCertificatePublicKey: string;
  appChainID: string;
}

class Logo {
  png: string;
  svg: string;
  appChainID: string;
}

class Explorer {
  url: string;
  txnPage: string;
  appChainID: string;
}

class AppNode {
  url: string;
  maintainer: string;
  apiCertificatePublicKey: string;
  appChainID: string;
}

export class GetAppsMetaData {
  chainID: string;
  chainName: string;
  displayName?: string;
  title: string;
  status: string;
  description: string;
  networkType: string;
  isDefault: boolean;
  genesisURL: string;
  projectPage: string;
  backgroundColor: string;
  serviceURLs: ServiceURL[];
  logo?: Logo;
  explorers: Explorer[];
  appNodes: AppNode[];
}

export class GetAppsMetaMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetAppsMetaResDto {
  data: GetAppsMetaData[];
  meta: GetAppsMetaMeta;
}

export const getAppsMetaResponse: ApiResponseOptions = {
  status: 200,
  description: 'Apps meta data have been successfully retrieved.',
  type: GetAppsMetaResDto,
};
