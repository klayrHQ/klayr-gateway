import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ValidatorRepoService } from './validator.repo-service';
import { GatewayResponse } from 'src/utils/helpers';
import { Validator } from '@prisma/client';

@ApiTags('Validator')
@Controller('validator')
export class ValidatorController {
  constructor(private readonly validatorRepoService: ValidatorRepoService) {}

  @Get()
  async getValidator(
    @Query('address') address: string,
  ): Promise<GatewayResponse<Partial<Validator>>> {
    const validator = await this.validatorRepoService.getValidator({ address });
    return new GatewayResponse(validator, { address: validator.address, name: validator.name });
  }
}
