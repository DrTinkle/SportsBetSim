# Use a Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package files for both frontend and backend
COPY package.json package-lock.json ./
COPY back/package.json back/package.json

# Install dependencies for both frontend and backend
RUN npm install
RUN cd back && npm install

# Copy the source files
COPY . .

# Build the frontend
RUN npm run build

# Expose the port for the backend
EXPOSE 5000

# Start the server
CMD ["node", "back/server.js"]
