import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ValidatorRepoService } from './validator.repo-service';
import { GetValidatorResponseDto, getValidatorResponse } from './dto/get-validator-res.dto';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { ValidatorQueryDto } from './dto/get-validator.dto';

@ApiTags('Validator')
@Controller('validator')
export class ValidatorController {
  constructor(private readonly validatorRepoService: ValidatorRepoService) {}

  @Get()
  @ApiResponse(getValidatorResponse)
  async getValidator(
    @Query() query: ValidatorQueryDto,
  ): Promise<GatewayResponse<GetValidatorResponseDto>> {
    const validator = await this.validatorRepoService.getValidator({ address: query.address });

    if (!validator) {
      throw new NotFoundException(`Validator with address ${query.address} not found`);
    }

    return new GatewayResponse(validator, { address: validator.account.address });
  }
}
