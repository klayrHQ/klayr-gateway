import { Module } from '@nestjs/common';
import { SchemasController } from './schemas.controller';
import { NodeApiModule } from '../node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [SchemasController],
})
export class SchemasModule {}
