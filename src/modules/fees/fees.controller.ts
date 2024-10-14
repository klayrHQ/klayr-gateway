import { Controller, Get } from '@nestjs/common';
import { NodeApi, NodeApiService } from '../node-api/node-api.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeeTokenID, MinFeePerByte } from '../node-api/types';
import { GetFeesResDto, getFeesResponse } from './dto/fees-res.dto';
import { GatewayResponse } from 'src/utils/controller-helpers';

@ApiTags('Fee')
@Controller('fees')
export class FeesController {
  constructor(private readonly nodeApi: NodeApiService) {}

  @Get()
  @ApiResponse(getFeesResponse)
  async getFees(): Promise<GatewayResponse<GetFeesResDto>> {
    const [feeTokenID, fees] = await Promise.all([
      this.nodeApi.invokeApi<FeeTokenID>(NodeApi.FEE_GET_FEE_TOKEN_ID, {}),
      this.nodeApi.invokeApi<MinFeePerByte>(NodeApi.FEE_GET_MIN_FEE_PER_BYTE, {}),
    ]);

    // TODO: Implement feeEstimatePerByte dont know where it comes from
    return new GatewayResponse(
      {
        feeEstimatePerByte: { low: 0, medium: 0, high: 0 },
        feeTokenID: feeTokenID.tokenID,
        minFeePerByte: fees.minFeePerByte,
      },
      {},
    );
  }
}
