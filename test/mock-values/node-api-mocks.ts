import { Block, NewBlockEvent } from 'src/node-api/types';

export const mockValidator = {
  address: 'klyythpdte6squq3h95k4xnk8njd65w5akrn8pwc3',
  name: 'uzamaru_testnet',
  blsKey:
    '8909c0b466ee39fe29a7797e6c070838c3190cf59288d1bc4fc194e8aa2b7ee164ed27f76645c9a4a0eb71948193349e',
  proofOfPossession:
    'a6e164c59b14172bc9be4392dcc022645adb7a84e38b13dc20d596bf36f96085393696eef94faea5e3ca9101f77583bf026b342b904e4e2befd04bfe87a5cc544c18980686c3b2e8162e50c0049bd49e09b4d89f50d6a47d44091b3c38d56904',
  generatorKey: '035357ac899392a0f61f39eb02fe45b1b8afc60cbe9109787a22cc48927bcfa2',
  lastGeneratedHeight: 0,
  isBanned: false,
  reportMisbehaviorHeights: [],
  consecutiveMissedBlocks: 0,
  commission: 10000,
  lastCommissionIncreaseHeight: 0,
  sharingCoefficients: [[Object]],
};

export const mockTransactions = [
  {
    id: '123',
    module: 'token',
    command: 'transfer',
    nonce: '2',
    fee: '10000000',
    senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
    params: '0fe9a3f1a21b5530f27f87a414b549e79',
    signatures: [
      '3cc8c8c81097fe59d9df356b3c3f1dd10f619bfabb54f5d187866092c67e0102c64dbe24f357df493cc7ebacdd2e55995db8912245b718d88ebf7f4f4ac01f04',
    ],
  },
  {
    id: '123123',
    module: 'token',
    command: 'transfer',
    nonce: '3',
    fee: '20000000',
    senderPublicKey: '1fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86b',
    params: '1fe9a3f1a21b5530f27f87a414b549e79',
    signatures: [
      '4cc8c8c81097fe59d9df356b3c3f1dd10f619bfabb54f5d187866092c67e0102c64dbe24f357df493cc7ebacdd2e55995db8912245b718d88ebf7f4f4ac01f05',
    ],
  },
];

export const newBlockEventMock: NewBlockEvent = {
  blockHeader: {
    version: 2,
    timestamp: 1715933580,
    height: 6,
    previousBlockID: '90df99b2009e3d597d9e4e46bd56fdb64cd9c16ba64037cea6d0b647f7114302',
    stateRoot: '319d5867def5bb0416d20e9ce82b118a4d4a33621b16630aec9b1164742c455c',
    assetRoot: '16e0adf57bd34d3268d0ba94518663a0184c270866b9948aab1c471239761adb',
    eventRoot: '491b4c3fc049d0576c0148406c49ba627215b7024f34d4d2c5a441dd195f9d33',
    transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    validatorsHash: 'c07c53b15b93ae64d2c00266dbb1996a9e37578bc4ffad4fe7c66b8f5d68fb9f',
    aggregateCommit: {
      height: 758,
      aggregationBits: 'ffffffff7f',
      certificateSignature:
        'a49a3661acf1118866c47917455bb702a751869f9e6933c3c314d0bb7adbdd4d01e44f824c30a9d970e150591e25736b000db0e10e2b4710cf1f34e767b641dae64b229d2288c5baad7923a6d507c11b0b2abb1b9993a05dc0a496a155d7d56e',
    },
    generatorAddress: 'klyythpdte6squq3h95k4xnk8njd65w5akrn8pwc3',
    maxHeightPrevoted: 785,
    maxHeightGenerated: 766,
    impliesMaxPrevotes: true,
    signature:
      '82330f3ef06f68452de8b443a13c900750c8cd7adeb13f91125aed7773f14b8999dff3e48da92752fdea136c44d765043a2e1611e987c2c7c9e82c35bb703a0b',
    id: 'df37836a0961caabb33252ebd136883d566fa6593d6769cead55a62353b45615',
  },
};

export const testBlock: Block = {
  header: {
    version: 2,
    timestamp: 1716473560,
    height: 133,
    previousBlockID: '515c48de90ea79d34354fef321c0c5e144594b577ab10d9f6c3c9178a6d7c15e',
    stateRoot: 'd84c24e7fa69cec425dd24063904e837ad8bae089142717b5631b0f031780f37',
    assetRoot: 'a827a79e36775d5945b74185753e42f2ffe7fb19bb453131c667b111a69730fe',
    eventRoot: '73bc4c77dab5b7c681eeca216fda6d87751253c5dfe5243f32ba4931a5a85163',
    transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    validatorsHash: 'f334e5ecd968b6dfafb15b73a79feadf2f22609ad90c8ac81be7fd0614a746a3',
    aggregateCommit: { height: 1024, aggregationBits: '', certificateSignature: '' },
    generatorAddress: 'klycgxqv3zoj3zyecrtqoug5efup7enn24jn4u3bx',
    maxHeightPrevoted: 1047,
    maxHeightGenerated: 1036,
    impliesMaxPrevotes: true,
    signature:
      'f0bb850e7b5be5e86e5d194ba4e94d2da2967c50afe07b361d2f68a184685f0229832dcb1860780913c1cd3bd03da67960d73bdaf4e566ee79f67fb9c6ef7800',
    id: '58ff0ed82917cfb22417daed4876473a37d11719371bd1200dd54f2dc80f422e',
  },
  transactions: mockTransactions,
  assets: [{ module: 'random', data: '0a108313188162a5d1a7d9c83fd9272e7c28' }],
};

export const newBlockArrayMock: Block[] = [
  {
    header: {
      version: 2,
      timestamp: 1715848423,
      height: 4,
      previousBlockID: 'eafcbecc4978e827f6d12a982c90574636edc20f567010abf4902452ee7a2702',
      stateRoot: 'a48a787d8c4811e135652cb1b8a6e9c70120fe98e6be83104ca4491a20053d87',
      assetRoot: 'cbae13ff2c54ed0186fc1105793609b95737f2332636ea3a2e7a2a4572bc8e72',
      eventRoot: '51bfc9e386cbd6e4c6df1e3004389fea026a036a21e35967fac39aa6f706bae4',
      transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      validatorsHash: 'fd63f965ad2899f06378c601158376e156c0f396559c57b47e7feeed5daa385b',
      aggregateCommit: {
        height: 1,
        aggregationBits: 'ffffffff7f',
        certificateSignature:
          'a49a3661acf1118866c47917455bb702a751869f9e6933c3c314d0bb7adbdd4d01e44f824c30a9d970e150591e25736b000db0e10e2b4710cf1f34e767b641dae64b229d2288c5baad7923a6d507c11b0b2abb1b9993a05dc0a496a155d7d56e',
      },
      generatorAddress: 'klycgxqv3zoj3zyecrtqoug5efup7enn24jn4u3bx',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature:
        'a790eac3b0d238319f720bb626aa43e100e3bbfce5252260ae0c95ba122bc140bd73ccbad5d073a96d347f006f6192623ba6e15d7829d16dd22e7785c8bb3c01',
      id: '51a95ba951de6ea97912cac45cf511353edd12df78469b511c208a0d4554a32a',
    },
    transactions: mockTransactions,
    assets: [{ module: 'random', data: '0a108313188162a5d1a7d9c83fd9272e7c28' }],
  },
  {
    header: {
      version: 2,
      timestamp: 1715848463,
      height: 3,
      previousBlockID: '51a95ba951de6ea97912cac45cf511353edd12df78469b511c208a0d4554a32a',
      stateRoot: 'debc543e344b94b1e77cc075d76a0cdaff22fc2377d6150240aa4c4cf7b2157f',
      assetRoot: '034d35b499684cc69b0b6c46646c117fdd6162b6a20a5d2d22d7b62360b18853',
      eventRoot: 'e862a6c50652e060a388209a1690487d5dc3984fc1096d3a33c462e42fa21b01',
      transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      validatorsHash: 'fd63f965ad2899f06378c601158376e156c0f396559c57b47e7feeed5daa385b',
      aggregateCommit: {
        height: 2,
        aggregationBits: 'ffffffff7f',
        certificateSignature:
          'a49a3661acf1118866c47917455bb702a751869f9e6933c3c314d0bb7adbdd4d01e44f824c30a9d970e150591e25736b000db0e10e2b4710cf1f34e767b641dae64b229d2288c5baad7923a6d507c11b0b2abb1b9993a05dc0a496a155d7d56e',
      },
      generatorAddress: 'klycgxqv3zoj3zyecrtqoug5efup7enn24jn4u3bx',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature:
        'aaf049771521bab9a4ed716531c31743c77f7cc70b5c1ce465c1dd25b2e861f21396035f10d87609cc0bc9893e86bb8788b0b6609ee930b02f8ef88be960bd0f',
      id: 'cde5657a9d5c1204a72d3b3ad68df8037aa68165131085a92608d58c1892b74d',
    },
    transactions: mockTransactions,
    assets: [{ module: 'random', data: '0a108313188162a5d1a7d9c83fd9272e7c28' }],
  },
  {
    header: {
      version: 2,
      timestamp: 1715850573,
      height: 2,
      previousBlockID: 'cde5657a9d5c1204a72d3b3ad68df8037aa68165131085a92608d58c1892b74d',
      stateRoot: '629554d8e59f65b10d118cacc1edcf5904461199d1d62b0ccdf2709cb0bed112',
      assetRoot: '1782b06b1f7e93916a0ad4486063f96889f6e8aca392ebaa7d4904b3f4df9d21',
      eventRoot: 'bb42afdece4d3e1c4eda78e673e9f86b76b0c0a16a176434d073e6369adbfda6',
      transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      validatorsHash: 'fd63f965ad2899f06378c601158376e156c0f396559c57b47e7feeed5daa385b',
      aggregateCommit: {
        height: 3,
        aggregationBits: 'ffffffff7f',
        certificateSignature:
          'a49a3661acf1118866c47917455bb702a751869f9e6933c3c314d0bb7adbdd4d01e44f824c30a9d970e150591e25736b000db0e10e2b4710cf1f34e767b641dae64b229d2288c5baad7923a6d507c11b0b2abb1b9993a05dc0a496a155d7d56e',
      },
      generatorAddress: 'klycgxqv3zoj3zyecrtqoug5efup7enn24jn4u3bx',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature:
        'fd343ee6e621b5d499edab755cb6c11f88c4da02657d392ec13194d0df4b7556aeace51414608166f20e6fae921588d4822bb941a67f38fb5a808a8a9483140a',
      id: 'f1e127290f3868937655401f65d3d7de3618340e6f2df7654b6e8e7b7e5618a8',
    },
    transactions: mockTransactions,
    assets: [{ module: 'random', data: '0a108313188162a5d1a7d9c83fd9272e7c28' }],
  },
  {
    header: {
      version: 2,
      timestamp: 1715850580,
      height: 1,
      previousBlockID: 'f1e127290f3868937655401f65d3d7de3618340e6f2df7654b6e8e7b7e5618a8',
      stateRoot: 'a6731ea8215d5292cd7c957032b062a8237467431757bfb048504c8db34364d9',
      assetRoot: '6735d64f5f9b41b0f315ca37a482153f02b4ebfcae005c059987bf770fe0dd87',
      eventRoot: '521e73ea75d0c7dafccfaf320be34585bb6046e07bb396e1782db6ea9b5c4a54',
      transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      validatorsHash: 'fd63f965ad2899f06378c601158376e156c0f396559c57b47e7feeed5daa385b',
      aggregateCommit: {
        height: 4,
        aggregationBits: 'ffffffff7f',
        certificateSignature:
          'a49a3661acf1118866c47917455bb702a751869f9e6933c3c314d0bb7adbdd4d01e44f824c30a9d970e150591e25736b000db0e10e2b4710cf1f34e767b641dae64b229d2288c5baad7923a6d507c11b0b2abb1b9993a05dc0a496a155d7d56e',
      },
      generatorAddress: 'klycgxqv3zoj3zyecrtqoug5efup7enn24jn4u3bx',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature:
        '971a312414e33154d0f10f9427cecdcf45178fda1f0a9aad68b2f3fa1d57d821ab74cead6a42efa03314922118c0e5c98b882664438c2f29d59cf00dc702a60c',
      id: '8c978cb33043050b4a116e111dd3e6bade923b889d194110d4424d8cb6d3dee6',
    },
    transactions: mockTransactions,
    assets: [{ module: 'random', data: '0a108313188162a5d1a7d9c83fd9272e7c28' }],
  },
  {
    header: {
      version: 2,
      timestamp: 1715850590,
      height: 0,
      previousBlockID: '8c978cb33043050b4a116e111dd3e6bade923b889d194110d4424d8cb6d3dee6',
      stateRoot: 'ab6a8a765b955be6ab0d64a0d39a999af527c0eda79d8cfc45bcc3e3713d5a17',
      assetRoot: 'bd8f808549e7204c7da6d7b3aafab1f7eb3146bd1378fd1b71bf25b8fd3fce6f',
      eventRoot: 'c2c9588fedb3d6038f90b6449877fc1ed3f25c4a70674b25b7530cad2d1a9572',
      transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      validatorsHash: 'fd63f965ad2899f06378c601158376e156c0f396559c57b47e7feeed5daa385b',
      aggregateCommit: {
        height: 5,
        aggregationBits: 'ffffffff7f',
        certificateSignature:
          'a49a3661acf1118866c47917455bb702a751869f9e6933c3c314d0bb7adbdd4d01e44f824c30a9d970e150591e25736b000db0e10e2b4710cf1f34e767b641dae64b229d2288c5baad7923a6d507c11b0b2abb1b9993a05dc0a496a155d7d56e',
      },
      generatorAddress: 'klycgxqv3zoj3zyecrtqoug5efup7enn24jn4u3bx',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature:
        'b93b20f02b46137fcf7cfccfd584b29a38e369947acde912ba5c24f1bcba3af19d0ec1565d964afd79047810c349d65ac20799daf866e4a1dacfccfd96c94f00',
      id: 'e8f28274af5be70684fede7b5a85985556cb5afa857fa2e3f8f5e8212be7654b',
    },
    transactions: mockTransactions,
    assets: [{ module: 'random', data: '0a108313188162a5d1a7d9c83fd9272e7c28' }],
  },
];
