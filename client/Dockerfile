# Use official Node.js image as base image
FROM node:18.18

WORKDIR /app

COPY package.json pnpm-lock.yaml ./


# RUN apk update && apk add git

RUN npm install

# RUN npm install -g pnpm
# RUN pnpm install

COPY . .

# RUN npm run build


EXPOSE 8001



CMD ["npm", "run", "dev"]



