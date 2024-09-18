import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { NodeApiModule } from 'src/modules/node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  providers: [],
  controllers: [EventController],
  exports: [],
})
export class EventModule {}
