# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.11.1
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app
ENV NODE_ENV="production"

FROM base as build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY --link package.json ./
RUN npm install --legacy-peer-deps

COPY --link . .
RUN npm run build

FROM base

RUN apt-get update -qq && apt-get install --no-install-recommends -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --link server.js ./

EXPOSE 3000
CMD [ "node", "server.js" ]
