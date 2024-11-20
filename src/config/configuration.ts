import {
  IsNumber,
  IsString,
  IsOptional,
  validateSync,
  IsEnum,
  ValidationError,
  IsIn,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

enum KlayrEnv {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

enum NodeEnv {
  Development = 'dev',
  Production = 'prod',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv, {
    message: `NODE_ENV must be one of the following values: ${Object.values(NodeEnv).join(', ')}`,
  })
  @IsString()
  NODE_ENV: string;

  @IsString()
  NODE_URL: string;

  @IsIn(['true', 'false'], { message: 'INDEX_KNOWN_ACCOUNTS must be either "true" or "false"' })
  INDEX_KNOWN_ACCOUNTS: string;

  @IsString()
  APP_REGISTRY_BRANCH: string;

  @IsEnum(KlayrEnv, {
    message: `KLAYR_ENV must be one of the following values: ${Object.values(KlayrEnv).join(', ')}`,
  })
  @IsString()
  KLAYR_ENV: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  LOKI_URL?: string;

  @IsString()
  @IsOptional()
  LOKI_APP?: string;

  @IsNumber()
  @IsOptional()
  PORT?: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error: ValidationError) => {
        return Object.values(error.constraints).join(', ');
      })
      .join('; ');
    throw new Error(errorMessages);
  }

  return validatedConfig;
}
