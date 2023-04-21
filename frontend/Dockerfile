FROM node:20 AS build

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build


# Build final image
FROM nginx:alpine

EXPOSE 80

COPY --from=build /app/build /usr/share/nginx/html
