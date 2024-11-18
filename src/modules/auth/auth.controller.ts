import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { NodeApi, NodeApiService } from '../node-api/node-api.service';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { GetAuthData, getAuthRes, GetAuthResDto } from './dto/get-auth-res.dto';
import { GetAuthDto } from './dto/get-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getAuthRes)
  async getAuth(@Query() query: GetAuthDto): Promise<GetAuthResDto> {
    const { address } = query;
    const account = await this.prisma.account.findFirst({
      where: {
        address,
      },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const auth = await this.nodeApi.invokeApi<GetAuthData>(NodeApi.AUTH_GET_AUTH_ACCOUNT, {
      address,
    });

    if (ControllerHelpers.isNodeApiError(auth))
      throw new HttpException(auth.error, HttpStatus.NOT_FOUND);

    return new GatewayResponse(auth, {
      address: account.address,
      publicKey: account.publicKey,
      name: account.name,
    });
  }
}
