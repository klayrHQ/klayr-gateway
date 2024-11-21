import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { GetEventsDto } from './dto/get-events.dto';
import { Prisma } from '@prisma/client';
import { MAX_EVENTS_TO_FETCH } from 'src/config/constants';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransactionEvents } from 'src/modules/transaction/types';
import { GetEventsData, GetEventsResDto, getEventsRes } from './dto/get-events-res.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { DefaultTopics } from './types';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getEventsRes)
  async getEvents(@Query() query: GetEventsDto): Promise<GetEventsResDto> {
    const {
      transactionID,
      senderAddress,
      module,
      name,
      blockID,
      topic,
      height,
      timestamp,
      sort,
      limit,
      offset,
    } = query;
    const { field, direction } = ControllerHelpers.validateSortParameter(sort);
    if (topic && this.checkTopics(topic)) {
      throw new BadRequestException('Default topics are not allowed');
    }
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
      ...(topic && { topics: { hasSome: topic.split(',') } }),
    };

    const [events, total] = await Promise.all([
      this.prisma.chainEvents.findMany({
        where,
        take,
        orderBy: {
          [field]: direction,
        },
        skip: offset,
        include: {
          block: {
            select: {
              id: true,
              height: true,
              timestamp: true,
            },
          },
        },
      }),
      this.prisma.chainEvents.count({ where }),
    ]);

    const eventResponse: GetEventsData[] = events.map((event) => this.toGetEventsResponse(event));

    return new GatewayResponse(eventResponse, { count: events.length, offset, total });
  }

  private toGetEventsResponse(
    event: Prisma.ChainEventsGetPayload<{
      include: { block: { select: { id: true; height: true; timestamp: true } } };
    }>,
  ): GetEventsData {
    const eventRes = {
      ...event,
      data:
        event.name === TransactionEvents.COMMAND_EXECUTION_RESULT
          ? event.data
          : JSON.parse(event.data),
      topics: event.topics,
    };
    return eventRes;
  }

  private checkTopics(topic: string): boolean {
    const topics = topic.split(',');
    return topics.every((t) => Object.values(DefaultTopics).includes(t as DefaultTopics));
  }
}
