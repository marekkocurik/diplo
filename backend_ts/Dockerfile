# Use Node.js 14 Alpine as the base image
FROM node:14-alpine

RUN apk add --no-cache git
# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Expose the server port
#EXPOSE 80

# Start the server
CMD ["npm", "run", "start"]