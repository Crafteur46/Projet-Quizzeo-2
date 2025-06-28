FROM node:20

WORKDIR /app

# Copy package files and install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate the client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"]
