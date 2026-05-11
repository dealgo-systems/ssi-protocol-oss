# Multi-stage build for SSI Gateway
FROM node:26-alpine AS builder

WORKDIR /app

# Copy package files
COPY reference/gateway/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY reference/gateway/ ./

# Build TypeScript
RUN npm run build

# Production image
FROM node:26-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create RPX directory
RUN mkdir -p /app/rpx

# Expose Gateway port
EXPOSE 4040

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4040/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4040
ENV KERNEL_URL=http://kernel:5050

# Run Gateway
CMD ["node", "dist/server.js"]
