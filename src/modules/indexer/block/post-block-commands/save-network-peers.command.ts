import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { LokiLogger } from 'nestjs-loki-logger';
import { BLOCKS_TO_SAVE_NETWORK_PEERS, LOCATION_API_URL } from 'src/config/constants';
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { NetworkPeers } from 'src/modules/node-api/types';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export type IpGeolocationResponse = {
  query: string;
  status: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  isp: string;
  as: string;
};

export class SaveNetworkPeersCommand {
  constructor(public readonly blockHeight: number) {}
}

@CommandHandler(SaveNetworkPeersCommand)
export class SaveNetworkPeersHandler implements ICommandHandler<SaveNetworkPeersCommand> {
  private readonly logger = new LokiLogger(SaveNetworkPeersHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute({ blockHeight }: SaveNetworkPeersCommand) {
    if (blockHeight % BLOCKS_TO_SAVE_NETWORK_PEERS !== 0) return;
    this.logger.debug('Saving network peers');

    const peers = await this.fetchConnectedNetworkPeers();
    if (!peers) return;

    const networkPeers = this.mapPeers(peers);
    const newPeerIpAddresses = networkPeers.map((peer) => peer.ip);

    await this.prisma.$transaction(async (prisma) => {
      await this.deleteOldPeers(prisma, newPeerIpAddresses);
      await this.upsertPeers(prisma, networkPeers);
    });

    this.logger.debug('Network peers saved successfully');
  }

  private async fetchConnectedNetworkPeers(): Promise<NetworkPeers[] | null> {
    try {
      const peers = await this.nodeApi.invokeApi<NetworkPeers[]>(
        NodeApi.NETWORK_GET_CONNECTED_PEERS,
        {},
      );

      return peers;
    } catch (error) {
      this.logger.error('Error: Failed to fetch network peers', error);
      return null;
    }
  }

  private mapPeers(peers: NetworkPeers[]): any[] {
    return peers.map((peer) => ({
      ip: peer.ipAddress,
      chainID: peer.chainID,
      networkVersion: peer.networkVersion,
      nonce: peer.nonce,
      advertiseAddress: peer.advertiseAddress,
      port: peer.port,
      peerId: peer.peerId,
      height: peer.options.height,
      maxHeightPrevoted: peer.options.maxHeightPrevoted,
      blockVersion: peer.options.blockVersion,
      lastBlockID: peer.options.lastBlockID,
      legacy: peer.options.legacy,
      state: 'connected',
    }));
  }

  private async deleteOldPeers(
    prisma: Prisma.TransactionClient,
    newPeerIpAddresses: string[],
  ): Promise<void> {
    await prisma.networkPeer.deleteMany({
      where: {
        ip: {
          notIn: newPeerIpAddresses,
        },
      },
    });
  }

  private async upsertPeers(prisma: Prisma.TransactionClient, networkPeers: any[]): Promise<void> {
    for (const networkPeer of networkPeers) {
      const existingLocation = await prisma.location.findUnique({
        where: { ip: networkPeer.ip },
      });

      if (!existingLocation) {
        const locationData = await this.findLocationByIp(networkPeer.ip);
        if (!locationData) continue;
        await prisma.location.create({
          data: {
            ip: networkPeer.ip,
            countryCode: locationData.countryCode,
            countryName: locationData.country,
            hostName: locationData.as,
            latitude: locationData.lat.toString(),
            longitude: locationData.lon.toString(),
          },
        });
      }

      await prisma.networkPeer.upsert({
        where: { ip: networkPeer.ip },
        update: networkPeer,
        create: networkPeer,
      });
    }
  }
  private async findLocationByIp(ipAddress: string): Promise<IpGeolocationResponse> {
    try {
      const response = await fetch(`${LOCATION_API_URL}/${ipAddress}`);
      const data: IpGeolocationResponse = await response.json();

      if (data.status === 'fail') {
        this.logger.error(`Failed to fetch country for IP ${ipAddress}: `);
        return;
      }
      return data;
    } catch (error) {
      this.logger.error(`Error fetching country for IP ${ipAddress}:`, error);
      return;
    }
  }
}
