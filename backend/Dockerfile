FROM node:20

WORKDIR /app

# Copy package files and install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

EXPOSE 3001

# Run the compiled JavaScript code
CMD ["npm", "run", "start"]
