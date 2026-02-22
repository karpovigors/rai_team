# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_YANDEX_GEOCODER_API_KEY
ENV VITE_YANDEX_GEOCODER_API_KEY=${VITE_YANDEX_GEOCODER_API_KEY}

COPY package*.json ./
RUN npm ci --foreground-scripts

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
