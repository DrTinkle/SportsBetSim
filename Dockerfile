# Build the React app
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Set up Nginx for frontend and backend
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the backend to the container
COPY back /app/back
WORKDIR /app/back
RUN npm install

# Expose ports
EXPOSE 80

# Start both Nginx and the backend
CMD ["sh", "-c", "node server.js & nginx -g 'daemon off;'"]
