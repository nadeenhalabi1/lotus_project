# backend/Dockerfile
FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy application code
COPY . .

# פורט ה-API
EXPOSE 3000

# פקודת הרצה
CMD ["npm", "start"]

