import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { StateService } from 'src/modules/state/state.service';
import { Modules, IndexerState } from 'src/modules/state/types';

@Injectable()
export class LockEndpointsMiddleware implements NestMiddleware {
  constructor(private readonly state: StateService) {}

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    if (
      process.env.LOCK_ENDPOINTS_DURING_SYNC === 'true' &&
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
