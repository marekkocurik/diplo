# Use Node.js 14 Alpine as the base image
FROM node:14-alpine

# Set the working directory
WORKDIR /srv/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the application
RUN npm run build

CMD ["npm", "run", "dev"]

# Expose the server port
#EXPOSE 80
#RUN npm install -g serve
#ENV VITE_APP_PORT=3000
# Start the server
#CMD ["npm", "run", "dev"]
#CMD ["npx", "serve", "-s", "build", "-l", "3000"]