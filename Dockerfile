# Base Image
FROM node:22-alpine

# Create working directory
WORKDIR /app

# Copy package files first
COPY backend/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy application source
COPY backend/ .

# Expose application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
