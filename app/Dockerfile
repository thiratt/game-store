# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.18.0

################################################################################
# Build stage - Build the Angular application
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production=false

# Copy source code
COPY . .

# Build the application for production
RUN npm run build --prod

################################################################################
# Production stage - Serve with nginx
FROM nginx:alpine AS final

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /usr/src/app/dist/app/browser /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Expose port 8080 (nginx will run on this port)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
