# Start of Selection
# Use the official Node.js image as the base image
FROM node:18.17.0

# Set the working directory
WORKDIR /app
ENV GOOGLE_API_KEY=""
ENV MONGO=""
ENV NEXT_PUBLIC_ORA_MANTA=""
ENV BROWSERLESS=""
ENV NEXT_PUBLIC_IGNORE_BUILD_ERROR=""
ENV SCREENSHOT_URL=""
ENV MINIO_ENDPOINT=""
ENV MINIO_ACCESS_KEY=""
ENV MINIO_SECRET_KEY=""
ENV MINIO_URL=""
ENV REDIS_URL=""
ENV NEYNAR=""
ENV NEXT_PUBLIC_OAO_PROMPT=""
ENV INFURA=""
ENV DETA=""
# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
# End of Selection
