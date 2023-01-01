FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

ENV NODE_ENV production


COPY . .

RUN npx prisma migrate dev --name init
RUN npm run build

CMD [ "npm", "run", "start" ]