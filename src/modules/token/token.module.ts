import { Module } from '@nestjs/common';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { NodeApiModule } from 'src/modules/node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}
