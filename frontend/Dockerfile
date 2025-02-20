# Use Node.js as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install

# Copy the application code
COPY . .

# Expose the port React will run on
EXPOSE 3000

# Set the default command to start the React app
CMD ["npm", "start"]
