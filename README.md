# Klayr Gateway

Klayr Gateway is the replacement of the old Klayr Service, built using the [NestJS](https://nestjs.com/) framework. It is designed to provide a more efficient and scalable way to interact with and explore the Klayr blockchain. The Gateway will serve as a key component of the Klayr ecosystem, offering enhanced performance and features over the previous explorer.

## Status

🚧 Work in Progress 🚧

This project is currently under active development. We are working towards building a robust and feature-rich platform, and it is not yet advised to run it yourself. As we continue development, we will update this README with detailed instructions on how to install, use, and contribute to the Klayr Gateway once it is ready for wider use.

## What's next?

We are aiming to create a stable and fully functional gateway for the Klayr blockchain. Stay tuned for updates! We’ll provide more information and guidance here as we approach our release milestones.

## Contact

For any questions, suggestions, or feedback, please reach out to us at hello@klayr.xyz.

## Installation

```bash
$ npm install
```

## Start local postgresql docker image:

```bash
docker run --rm --name pg -p 5432:5432 -e POSTGRES_PASSWORD=welcome postgres:16
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

## Running test node (optional)

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

## Swagger api

http://localhost:9901/api

## License

Copyright 2024 Klayr Labs B.V.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
