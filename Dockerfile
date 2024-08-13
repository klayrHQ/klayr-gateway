FROM node:18 as build
WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx prisma migrate dev --preview-feature --name init
RUN npm run build

FROM node:18-slim
RUN apt update && apt install libssl-dev dumb-init -y --no-install-recommends
WORKDIR /usr/src/app

# probably move to cluster or github
ENV DATABASE_URL="postgres://postgres:welcome@localhost/postgres"
ENV NODE_ENV="dev"
ENV NODE_URL="wss://testnet.klayr.xyz/rpc-ws"
ENV PORT=9901

COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/package.json .
COPY --chown=node:node --from=build /usr/src/app/package-lock.json .
COPY --chown=node:node --from=build /usr/src/app/prisma/db/dev.db ./prisma/db/dev.db

RUN npm install --omit=dev
COPY --chown=node:node --from=build /usr/src/app/node_modules/.prisma/client  ./node_modules/.prisma/client

CMD ["dumb-init", "node", "dist/main"]