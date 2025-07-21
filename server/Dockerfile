# server/Dockerfile

FROM node:22-alpine

# Set the working directory
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps
RUN npm install -g nodemon

# Copy the rest of the application code
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]