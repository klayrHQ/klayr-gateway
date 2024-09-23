import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { NodeApiModule } from '../node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [AuthController],
})
export class AuthModule {}
