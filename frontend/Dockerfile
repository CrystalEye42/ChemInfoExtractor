FROM node:20 AS build

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install

COPY . .
RUN yarn build


# Build final image
FROM nginx:alpine

EXPOSE 80

COPY --from=build /app/build /usr/share/nginx/html
