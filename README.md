## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running test node

first npm install and npm run build in the test/test-node folder.

```bash
$ npm run start:test-node
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Prisma

### For dev.db

npx prisma migrate dev --preview-feature --schema prisma/schema.prisma

### For test.db

npx prisma migrate dev --preview-feature --schema prisma/test-schema.prisma

## Swagger api

http://localhost:9901/api

## Create tx

sunset arctic describe battle negative grace fame pottery spin warm wasp arctic country possible corn company front spin pear together dizzy try actress one

```bash
./bin/run transaction:create token transfer 10000000 --params='{"tokenID": "0400000000000000", "recipientAddress": "klys9u6yy466q2mpbj92cmbp64eg7gvpuz7v4efm8", "amount": "9999", "data": ""}' --json --pretty
```
