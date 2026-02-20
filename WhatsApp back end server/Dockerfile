FROM node:20-alpine

WORKDIR /app

# Install dependencies needed for some native modules if required (usually Baileys is fine on pure node, but keeping git just in case)
RUN apk add --no-cache git

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
