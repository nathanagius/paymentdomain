FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm install
COPY ./src ./src
RUN npx tsc
EXPOSE 4001
CMD ["node", "dist/index.js"] 