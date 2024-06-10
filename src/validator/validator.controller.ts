import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ValidatorRepoService } from './validator.repo-service';
import { GatewayResponse } from 'src/utils/helpers';
import { IsNotEmpty, IsString } from 'class-validator';
import { addressQuery } from './open-api/request-types';
import { GetValidatorResponse, getValidatorResponse } from './open-api/return-types';

class ValidatorQueryDto {
  @IsString()
  @IsNotEmpty()
  address: string;
}

@ApiTags('Validator')
@Controller('validator')
export class ValidatorController {
  constructor(private readonly validatorRepoService: ValidatorRepoService) {}

  @Get()
  @ApiQuery(addressQuery)
  @ApiResponse(getValidatorResponse)
  async getValidator(
    @Query() query: ValidatorQueryDto,
  ): Promise<GatewayResponse<GetValidatorResponse>> {
    const validator = await this.validatorRepoService.getValidator({ address: query.address });

    if (!validator) {
      throw new NotFoundException(`Validator with address ${query.address} not found`);
    }

    return new GatewayResponse(validator, { address: validator.account.address });
  }
}
