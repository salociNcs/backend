# Use the official Node.js 16 image.
FROM node:16

# Create and change to the app directory.
WORKDIR /usr/src/app

# Install dependencies.
COPY package*.json ./
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy application code.
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Start the application with nodemon
CMD ["nodemon", "server.js"]
