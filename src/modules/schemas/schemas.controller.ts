import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { getSchemaRes, GetSchemaResDto } from './dto/get-schemas-res.dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Schemas')
@Controller('schemas')
export class SchemasController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiResponse(getSchemaRes)
  async getSchemas(): Promise<GetSchemaResDto> {
    const cachedSchema = await this.prisma.cachedSchemas.findFirst();

    const schemas = JSON.parse(cachedSchema.schema);
    const metaData = JSON.parse(cachedSchema.metaData);

    return new GatewayResponse({ ...schemas, ...metaData }, {});
  }
}
