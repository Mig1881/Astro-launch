FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY server/ ./server/ 
RUN npm install
EXPOSE 3000
CMD ["node", "server/server.cjs"]