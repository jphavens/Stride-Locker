FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_STRIDE_SHARED_KEY is read by import.meta.env at build time and baked
# into the client bundle — .dockerignore excludes .env.local from the build
# context, so it must arrive as a build arg (see docker-compose.yml).
ARG VITE_STRIDE_SHARED_KEY
ENV VITE_STRIDE_SHARED_KEY=$VITE_STRIDE_SHARED_KEY
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY server ./server
EXPOSE 5173
CMD ["node", "server/index.js"]
