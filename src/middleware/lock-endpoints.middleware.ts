import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { StateService } from 'src/state/state.service';
import { Modules, IndexerState } from 'src/state/types';

@Injectable()
export class LockEndpointsMiddleware implements NestMiddleware {
  constructor(private readonly state: StateService) {}

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    if (
      process.env.NODE_ENV === 'prod' &&
      this.state.get(Modules.INDEXER) === IndexerState.SYNCING
    ) {
      res.statusCode = 503;
      res.write('Gateway is syncing, try again later...');
      res.end();
    } else {
      next();
    }
  }
}
