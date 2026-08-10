FROM node:24-alpine AS build

WORKDIR /app
COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine AS production

WORKDIR /app
COPY package*.json .

RUN npm ci --omit=dev

COPY --from=build /app/dist .

CMD ["node", "main.js"]