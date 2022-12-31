FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

ENV NODE_ENV production

RUN npm install

COPY . .

RUN npx prisma migrate dev --name init
RUN npm run build

CMD [ "npm", "run", "start" ]