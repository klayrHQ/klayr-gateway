import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { BlockModule } from 'src/block/block.module';
import { ValidatorModule } from 'src/validator/validator.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [BlockModule, ValidatorModule, TransactionModule],
  controllers: [SearchController],
})
export class SearchModule {}
