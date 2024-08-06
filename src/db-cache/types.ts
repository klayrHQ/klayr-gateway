import { Prisma } from '@prisma/client';

export type UpdateType = {
  where:
    | Prisma.ValidatorWhereUniqueInput
    | Prisma.TransactionWhereUniqueInput
    | Prisma.BlockWhereUniqueInput;
  data: Prisma.ValidatorUpdateInput | Prisma.TransactionUpdateInput | Prisma.BlockUpdateInput;
  model: Models;
};

export enum Models {
  VALIDATOR = 'validator',
  TRANSACTION = 'transaction',
  BLOCK = 'block',
}
