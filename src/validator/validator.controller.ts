import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ValidatorRepoService } from './validator.repo-service';
import { GetValidatorResponseDto, getValidatorResponse } from './dto/get-validator-res.dto';
import { GatewayResponse } from 'src/utils/controller-helpers';
import { ValidatorQueryDto } from './dto/get-validator.dto';
import { MAX_VALIDATORS_TO_FETCH } from 'src/utils/constants';
import { Prisma } from '@prisma/client';

@ApiTags('Validators')
@Controller('pos')
export class ValidatorController {
  constructor(private readonly validatorRepoService: ValidatorRepoService) {}

  @Get('validators')
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

    const response = validators.map((validator) => this.getValidatorResponse(validator));

    return new GatewayResponse(response, { count: validators.length, offset, total });
  }

  private getValidatorResponse(
    validator: Prisma.ValidatorGetPayload<{ include: { account: true } }>,
  ): GetValidatorResponseDto {
    const { account, ...rest } = validator;
    const newValidator: GetValidatorResponseDto = {
      ...rest,
      account: {
        address: account.address,
        publicKey: account.publicKey,
        name: account.name,
      },
      totalStake: validator.totalStake.toString(),
      selfStake: validator.selfStake.toString(),
      validatorWeight: validator.validatorWeight.toString(),
      sharingCoefficients: JSON.parse(validator.sharingCoefficients),
    };

    if (!account.publicKey) delete account.publicKey;
    return newValidator;
  }
}
