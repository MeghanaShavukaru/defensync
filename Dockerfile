# Multi-stage build for combined frontend + backend deployment
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM node:20-slim AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
RUN npm run prisma:generate
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/frontend/dist ./frontend/dist
COPY backend/package*.json ./backend/
EXPOSE 4000
ENV NODE_ENV=production
WORKDIR /app/backend
CMD ["node", "dist/server.js"]
