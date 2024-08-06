import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GeneratorQueryDto } from './dto/get-generators.dto';
import { AccountRepoService } from 'src/account/account-repo.service';
import { getGeneratorResponse, GetGeneratorResponseDto } from './dto/get-generators-res.dto';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { GeneratorList } from 'src/node-api/types';
import { GatewayResponse } from 'src/utils/controller-helpers';

@ApiTags('Generators')
@Controller('generators')
export class GeneratorController {
  constructor(
    private readonly accountRepoService: AccountRepoService,
    private readonly nodeApiService: NodeApiService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getGeneratorResponse)
  async getValidator(
    @Query() query: GeneratorQueryDto,
  ): Promise<GatewayResponse<GetGeneratorResponseDto[]>> {
    const { search, limit, offset } = query;

    const [accounts, count] = await Promise.all([
      this.accountRepoService.searchAccount(search, limit, offset),
      this.accountRepoService.countAccounts(search),
    ]);

    const { list } = await this.nodeApiService.invokeApi<GeneratorList>(
      NodeApi.CHAIN_GET_GENERATOR_LIST,
      {},
    );
    if (!list) throw new Error('Failed to fetch generator list');

    const accountResponse: GetGeneratorResponseDto[] = accounts.map((account) => {
      const { validator, ...rest } = account;
      const generator = list.find((gen) => gen.address === account.address);
      const newAccount = {
        ...rest,
        status: validator?.status,
        nextAllocatedTime: generator ? generator.nextAllocatedTime : undefined,
      };
      return newAccount;
    });

    return new GatewayResponse(accountResponse, {
      count: accountResponse.length,
      offset,
      total: count,
    });
  }
}
