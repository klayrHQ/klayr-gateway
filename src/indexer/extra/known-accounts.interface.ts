interface AccountInfo {
  owner: string;
  description: string;
}

export type KnownAccounts = {
  [address: string]: AccountInfo;
};
