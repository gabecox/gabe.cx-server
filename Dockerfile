FROM node:18

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
 
RUN npm install 
# RUN npm install --production

COPY . .

COPY .env.production .env

RUN npm run build

ENV NODE_ENV production

EXPOSE 8080
CMD ["node", "dist/index.js"]

USER node