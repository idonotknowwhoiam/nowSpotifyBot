FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

ENV NODE_ENV production


COPY . .

RUN npx prisma migrate dev --name init
RUN npm run build

CMD [ "npm", "run", "start" ]