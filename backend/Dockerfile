# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root and backend package definitions
COPY backend/package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile=false

# Copy backend source
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Build TypeScript
RUN pnpm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY backend/package.json ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile=false

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Non-root user for security
USER node

EXPOSE 4000

CMD ["node", "dist/index.js"]
