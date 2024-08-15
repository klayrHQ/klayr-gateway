import { Controller, Query, Get, ValidationPipe, UsePipes } from '@nestjs/common';
import { BlockRepoService } from 'src/block/block-repo.service';
import { TransactionRepoService } from 'src/transaction/transaction-repo.service';
import { ValidatorRepoService } from 'src/validator/validator.repo-service';
import { SearchQueryDto } from './dto/get-search.dto';
import { ApiResponse } from '@nestjs/swagger';
import { GetSearchResponse, getSearchResponse } from './dto/get-search-res.dto';
import { getKlayr32AddressFromAddress } from 'src/utils/helpers';
import { HEX_ADDRESS_LENGTH } from 'src/utils/constants';

@Controller('search')
export class SearchController {
  constructor(
    private readonly blockRepoService: BlockRepoService,
    private readonly validatorRepoService: ValidatorRepoService,
    private readonly transactionRepoService: TransactionRepoService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getSearchResponse)
  async getSearchResults(@Query() query: SearchQueryDto): Promise<GetSearchResponse> {
    let { search } = query;

    if (search.length === HEX_ADDRESS_LENGTH) {
      search = getKlayr32AddressFromAddress(search);
    }

    const [blocks, validators, transactions] = await Promise.all([
      this.blockRepoService.searchBlocks(search),
      this.validatorRepoService.searchValidators(search),
      this.transactionRepoService.searchTransactions(search),
    ]);

    const formattedBlocks = blocks.map((block) => ({
      height: block.height,
      id: block.id,
    }));

    const formattedValidators = validators.map((validator) => ({
      name: validator.account.name,
      address: validator.address,
      publicKey: validator.account.publicKey,
      rank: validator.rank,
    }));

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      sender: transaction.sender.address,
    }));

    return {
      validators: formattedValidators,
      blocks: formattedBlocks,
      transactions: formattedTransactions,
    };
  }
}
