import { NodeApi } from 'src/node-api/node-api.service';
import { newBlockArrayMock, newBlockEventMock, testBlock } from 'test/mock-values/node-api-mocks';

export class MockNodeApiService {
  getAndSetNodeInfo = jest
    .fn()
    .mockResolvedValue({ height: 5, genesisHeight: 0, finalizedHeight: 150 });
  getBlocksFromNode = jest.fn().mockResolvedValue(newBlockArrayMock);
  subscribeToNewBlock = jest.fn().mockResolvedValue(newBlockEventMock);
  nodeInfo = { height: 5, genesisHeight: 0, finalizedHeight: 150 };
  decodeTxData = jest.fn().mockResolvedValue({ type: 'transfer', data: {} });

  invokeApi = jest.fn().mockImplementation((apiName, params) => {
    switch (apiName) {
      case NodeApi.REWARD_GET_DEFAULT_REWARD_AT_HEIGHT:
        return Promise.resolve({ reward: '5000000' });
      case NodeApi.CHAIN_GET_BLOCKS_BY_HEIGHT:
        return Promise.resolve([testBlock]);
      default:
        return Promise.resolve();
    }
  });
}
