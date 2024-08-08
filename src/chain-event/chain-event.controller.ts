import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChainEventRepoService } from './chain-event-repo.service';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { GetEventsDto } from './dto/get-events.dto';
import { Prisma } from '@prisma/client';
import { MAX_EVENTS_TO_FETCH } from 'src/utils/constants';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransactionEvents } from 'src/transaction/types';
import { GetEventsResDto, getEventsResponse } from './dto/get-events-res.dto';

@ApiTags('Events')
@Controller('events')
export class ChainEventController {
  constructor(private readonly repoService: ChainEventRepoService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getEventsResponse)
  async getEvents(@Query() query: GetEventsDto): Promise<GatewayResponse<GetEventsResDto[]>> {
    const {
      transactionID,
      senderAddress,
      module,
      name,
      blockID,
      height,
      timestamp,
      sort,
      limit,
      offset,
    } = query;
    const { field, direction } = ControllerHelpers.validateSortParameter(sort);
    const take = Math.min(limit, MAX_EVENTS_TO_FETCH);

    const where: Prisma.ChainEventsWhereInput = {
      ...(module && { module }),
      ...(name && { name }),
      ...(transactionID && { transactionID }),
      ...(height && { height: ControllerHelpers.buildRangeCondition(height) }),
      ...(timestamp && { block: { timestamp: ControllerHelpers.buildRangeCondition(timestamp) } }),
      ...(blockID && { block: { id: blockID } }),
      ...(senderAddress && {
        transaction: {
          senderAddress: senderAddress,
        },
      }),
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

    const eventResponse: GetEventsResDto[] = events.map((event) => this.toGetEventsResponse(event));

    return new GatewayResponse(eventResponse, { count: events.length, offset, total });
  }

  private toGetEventsResponse(
    event: Prisma.ChainEventsGetPayload<{
      include: { block: { select: { id: true; height: true; timestamp: true } } };
    }>,
  ): GetEventsResDto {
    const eventRes = {
      ...event,
      data:
        event.name === TransactionEvents.COMMAND_EXECUTION_RESULT
          ? event.data
          : JSON.parse(event.data),
      topics: JSON.parse(event.topics),
    };
    return eventRes;
  }
}
