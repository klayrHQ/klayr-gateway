import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChainEventRepoService } from './chain-event-repo.service';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { GetEventsDto } from './dto/get-events.dto';
import { Prisma } from '@prisma/client';
import { MAX_EVENTS_TO_FETCH } from 'src/utils/constants';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class ChainEventController {
  constructor(private readonly repoService: ChainEventRepoService) {}

  // TODO: Link to transaction
  // TODO: Response dto
  // TODO: Queries
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async getEvents(@Query() query: GetEventsDto): Promise<GatewayResponse<any[]>> {
    const { height, sort, limit, offset } = query;
    const { field, direction } = ControllerHelpers.validateSortParameter(sort);
    const take = Math.min(limit, MAX_EVENTS_TO_FETCH);

    const where: Prisma.ChainEventsWhereInput = {
      ...(height && { height: ControllerHelpers.buildRangeCondition(height) }),
    };

    const [events, total] = await Promise.all([
      this.repoService.getChainEvents({
        where,
        take,
        orderBy: {
          [field]: direction,
        },
        skip: offset,
      }),
      this.repoService.countChainEvents({ where }),
    ]);

    const eventResponse: any[] = events.map((event) => this.toGetEventsResponse(event));

    return new GatewayResponse(eventResponse, { count: events.length, offset, total });
  }

  private toGetEventsResponse(
    event: Prisma.ChainEventsGetPayload<{
      include: { block: { select: { id: true; height: true; timestamp: true } } };
    }>,
  ): any {
    const eventRes = {
      ...event,
      data: JSON.parse(event.data),
      topics: JSON.parse(event.topics),
    };
    return eventRes;
  }
}
