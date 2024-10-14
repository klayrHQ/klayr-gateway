export interface AppJsonContents {
  title: string;
  description: string;
  chainName: string;
  displayName: string;
  chainID: string;
  networkType: string;
  genesisURL: string;
  projectPage: string;
  backgroundColor: string;
  logo: {
    png: string;
    svg: string;
  };
  serviceURLs: {
    http: string;
    ws: string;
    apiCertificatePublicKey: string;
  }[];
  explorers: {
    url: string;
    txnPage: string;
  }[];
  appNodes: {
    url: string;
    maintainer: string;
    apiCertificatePublicKey: string;
  }[];
}
