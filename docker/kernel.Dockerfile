# Multi-stage build for SSI Kernel
FROM node:26-alpine AS builder

WORKDIR /app

# Copy package files
COPY reference/kernel/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY reference/kernel/ ./

# Build TypeScript
RUN npm run build

# Production image
FROM node:26-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy governance envelopes
COPY --from=builder /app/envelopes ./envelopes

# Expose Kernel port
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5050/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5050

# Run Kernel
CMD ["node", "dist/server.js"]
