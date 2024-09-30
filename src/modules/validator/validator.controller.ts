import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { GetValidatorInfoResDto, getValidatorInfoResponse } from './dto/get-validator-info-res';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { GetValidatorInfoDto } from './dto/get-validator-info';
import { postValidateBlsKeyRes, PostValidateBlsKeyResDto } from './dto/post-validate-bls-key-res';
import { PostValidateBlsKeyDto } from './dto/post-validate-bls-key';
import { NodeApi, NodeApiService } from '../node-api/node-api.service';
import { NodeApiError, ValidateBlsKey } from '../node-api/types';

@ApiTags('Validator')
@Controller('validator')
export class ValidatorController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getValidatorInfoResponse)
  async getValidatorInfo(
    @Query() query: GetValidatorInfoDto,
  ): Promise<GatewayResponse<GetValidatorInfoResDto>> {
    const { address } = query;
    const validator = await this.prisma.validator.findFirst({
      where: {
        ...(address && { address: address }),
      },
      select: {
        generatorKey: true,
        blsKey: true,
        proofOfPossession: true,
      },
    });

    if (!validator) throw new HttpException('Validator not found', HttpStatus.NOT_FOUND);

    const account = await this.prisma.account.findFirst({
      where: {
        address,
      },
      select: {
        address: true,
        publicKey: true,
        name: true,
      },
    });

    return new GatewayResponse(validator, account);
  }

  @Post('validate-bls-key')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(postValidateBlsKeyRes)
  async validateBlsKey(
    @Body() body: PostValidateBlsKeyDto,
  ): Promise<GatewayResponse<PostValidateBlsKeyResDto>> {
    const { blsKey, proofOfPossession } = body;

    const res = await this.nodeApi.invokeApi<ValidateBlsKey | NodeApiError>(
      NodeApi.VALIDATORS_VALIDATE_BLS_KEY,
      {
        proofOfPossession,
        blsKey,
      },
    );

    if (ControllerHelpers.isNodeApiError(res))
      throw new HttpException(res.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse({ isValid: res.valid }, {});
  }
}
