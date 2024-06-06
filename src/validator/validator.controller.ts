import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ValidatorRepoService } from './validator.repo-service';
import { GatewayResponse } from 'src/utils/helpers';
import { Validator } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

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
  async getValidator(
    @Query() query: ValidatorQueryDto,
  ): Promise<GatewayResponse<Partial<Validator>>> {
    const validator = await this.validatorRepoService.getValidator({ address: query.address });

    if (!validator) {
      throw new NotFoundException(`Validator with address ${query.address} not found`);
    }

    return new GatewayResponse(validator, { address: validator.address, name: validator.name });
  }
}
