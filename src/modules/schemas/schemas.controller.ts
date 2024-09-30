import { BadRequestException, Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { NodeApi, NodeApiService } from '../node-api/node-api.service';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { getSchemaResponse } from './dto/get-schemas-res.dto';

@ApiTags('Schemas')
@Controller('schemas')
export class SchemasController {
  constructor(private readonly nodeApi: NodeApiService) {}

  @Get()
  @ApiResponse(getSchemaResponse)
  async getSchemas() {
    const schemas = await this.nodeApi.invokeApi<any>(NodeApi.SYSTEM_GET_SCHEMA, {});

    if (ControllerHelpers.isNodeApiError(schemas))
      throw new HttpException(schemas.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse(schemas, {});
  }
}
