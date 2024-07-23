import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ValidatorRepoService } from './validator.repo-service';
import { GetValidatorResponseDto, getValidatorResponse } from './dto/get-validator-res.dto';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { ValidatorQueryDto } from './dto/get-validator.dto';
import { MAX_VALIDATORS_TO_FETCH } from 'src/utils/constants';
import { Prisma } from '@prisma/client';

@ApiTags('Validators')
@Controller('validators')
export class ValidatorController {
  constructor(private readonly validatorRepoService: ValidatorRepoService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getValidatorResponse)
  async getValidator(
    @Query() query: ValidatorQueryDto,
  ): Promise<GatewayResponse<GetValidatorResponseDto[]>> {
    const { address, limit, offset } = query;
    const take = Math.min(limit, MAX_VALIDATORS_TO_FETCH);

    const where: Prisma.ValidatorWhereInput = {
      ...(address && { address }),
    };

    const [validators, total] = await Promise.all([
      this.validatorRepoService.getValidators({
        where,
        take,
        orderBy: {
          ['rank']: 'asc', // probably will change
        },
        skip: offset,
      }),
      this.validatorRepoService.countValidators({ where }),
    ]);

    return new GatewayResponse(validators, { count: validators.length, offset, total });
  }
}
