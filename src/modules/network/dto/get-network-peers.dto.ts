import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { NetworkPeersSortTypes } from 'src/utils/controller-helpers';

export class GetNetworkPeersDto {
  /**
   * Filter peers by IP address.
   */
  @IsString()
  @IsOptional()
  ip?: string;

  /**
   * Filter peers by height.
   */
  @IsString()
  @IsOptional()
  height?: string;

  /**
   * Filter peers by state.
   */
  @IsString()
  @IsOptional()
  state?: string;

  /**
   * Filter peers by network version.
   */
  @IsString()
  @IsOptional()
  networkVersion?: string;

  /**
   * Sort peers.
   */
  @IsString()
  @IsEnum(NetworkPeersSortTypes, {
    message:
      'sort must be one of the following values: ' +
      Object.values(NetworkPeersSortTypes).join(', '),
  })
  sort?: NetworkPeersSortTypes = NetworkPeersSortTypes.HEIGHT_DESC;

  /**
   * Limit the number of peers fetched.
   */
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = 10;

  /**
   * Offset for the peers fetched.
   */
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
