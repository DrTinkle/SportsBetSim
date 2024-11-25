# Stage 1: Build the React frontend
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Set up backend and Nginx for serving frontend
FROM node:18 AS backend
WORKDIR /app/back
COPY back /app/back
RUN npm install

# Final Stage: Set up Nginx to serve the frontend and reverse-proxy the backend
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=backend /app/back /app/back
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80

# Start both Nginx and the backend
CMD ["sh", "-c", "node /app/back/server.js & nginx -g 'daemon off;'"]
