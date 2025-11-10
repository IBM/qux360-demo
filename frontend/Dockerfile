FROM node:18-alpine

WORKDIR /app

# Copy package.json first for build caching
COPY package.json package-lock.json* ./

RUN npm install

# Copy the rest of the frontend files
COPY . .

EXPOSE 5173

# Use Vite dev server and bind to 0.0.0.0 so it's reachable from host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
