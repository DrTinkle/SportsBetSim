# Stage 1: Build the React frontend
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Final Stage: Combine backend and Nginx
FROM node:18
WORKDIR /app

# Copy React build files to Nginx's static directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy backend files
COPY back /app/back
WORKDIR /app/back
RUN npm install

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Render's PORT
ENV PORT=5000
EXPOSE 5000

# Start the backend and Nginx
CMD ["sh", "-c", "node /app/back/server.js & nginx -g 'daemon off;'"]
