# client/Dockerfile

FROM node:22-alpine

# Set the working directory
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]