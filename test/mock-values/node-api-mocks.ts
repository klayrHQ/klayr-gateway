import { NewBlockEvent } from 'src/node-api/types';

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

export const newBlockArrayMock: NewBlockEvent[] = [
  {
    header: {
      version: 0,
      timestamp: 1715848131,
      height: 0,
      previousBlockID: '0000000000000000000000000000000000000000000000000000000000000000',
      stateRoot: '7f90bc94ce3ca10cc1700c095119aa4b4070b7e186644eb68419feef4d339a5d',
      assetRoot: 'c5213526c655da499031ea27a9aca7da32cf8a30ef0946113f90a66b136d88be',
      eventRoot: 'd442b9b7d4cbc86a365425faf4f044ba7d30cb0a89a1fda54ef2339c25bfe7e1',
      transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      validatorsHash: 'fd63f965ad2899f06378c601158376e156c0f396559c57b47e7feeed5daa385b',
      aggregateCommit: {
        height: 0,
        aggregationBits: 'ffffffff7f',
        certificateSignature:
          'a49a3661acf1118866c47917455bb702a751869f9e6933c3c314d0bb7adbdd4d01e44f824c30a9d970e150591e25736b000db0e10e2b4710cf1f34e767b641dae64b229d2288c5baad7923a6d507c11b0b2abb1b9993a05dc0a496a155d7d56e',
      },
      generatorAddress: 'klyzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz5fw596',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature: '',
      id: 'eafcbecc4978e827f6d12a982c90574636edc20f567010abf4902452ee7a2702',
    },
  },
  {
    header: {
      version: 2,
      timestamp: 1715848423,
      height: 1,
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
      generatorAddress: 'kly2nd42c95pq86bs3yf6jyp2qzmxfas3bcbn9rkf',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature:
        'a790eac3b0d238319f720bb626aa43e100e3bbfce5252260ae0c95ba122bc140bd73ccbad5d073a96d347f006f6192623ba6e15d7829d16dd22e7785c8bb3c01',
      id: '51a95ba951de6ea97912cac45cf511353edd12df78469b511c208a0d4554a32a',
    },
  },
  {
    header: {
      version: 2,
      timestamp: 1715848463,
      height: 2,
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
      generatorAddress: 'klya88przk8of3cj8rg28jm7sj9nsty44284jjatv',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature:
        'aaf049771521bab9a4ed716531c31743c77f7cc70b5c1ce465c1dd25b2e861f21396035f10d87609cc0bc9893e86bb8788b0b6609ee930b02f8ef88be960bd0f',
      id: 'cde5657a9d5c1204a72d3b3ad68df8037aa68165131085a92608d58c1892b74d',
    },
  },
  {
    header: {
      version: 2,
      timestamp: 1715850573,
      height: 3,
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
      generatorAddress: 'klyj64akppm64z837twzzrhqeo2r2mzayxr7fazyp',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature:
        'fd343ee6e621b5d499edab755cb6c11f88c4da02657d392ec13194d0df4b7556aeace51414608166f20e6fae921588d4822bb941a67f38fb5a808a8a9483140a',
      id: 'f1e127290f3868937655401f65d3d7de3618340e6f2df7654b6e8e7b7e5618a8',
    },
  },
  {
    header: {
      version: 2,
      timestamp: 1715850580,
      height: 4,
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
      generatorAddress: 'klyhmea88d4vb5hf68mpusma3dgyx9s9wodczgryp',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature:
        '971a312414e33154d0f10f9427cecdcf45178fda1f0a9aad68b2f3fa1d57d821ab74cead6a42efa03314922118c0e5c98b882664438c2f29d59cf00dc702a60c',
      id: '8c978cb33043050b4a116e111dd3e6bade923b889d194110d4424d8cb6d3dee6',
    },
  },
  {
    header: {
      version: 2,
      timestamp: 1715850590,
      height: 5,
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
      generatorAddress: 'klyhozckft5w9t5wxg4qk83xt22ks2u6n9rncztux',
      maxHeightPrevoted: 0,
      maxHeightGenerated: 0,
      impliesMaxPrevotes: true,
      signature:
        'b93b20f02b46137fcf7cfccfd584b29a38e369947acde912ba5c24f1bcba3af19d0ec1565d964afd79047810c349d65ac20799daf866e4a1dacfccfd96c94f00',
      id: 'e8f28274af5be70684fede7b5a85985556cb5afa857fa2e3f8f5e8212be7654b',
    },
  },
];
