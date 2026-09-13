# --- Stage 1: Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Menggunakan package.json saja (tanpa lockfile)
COPY package.json ./

# Menggunakan 'npm install' karena tidak ada package-lock.json
RUN npm install

COPY . .

# Kompilasi TypeScript
RUN npm run build

# --- Stage 2: Production Stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./

# Menggunakan 'npm install' dengan bendera baru '--omit=dev' sesuai saran log error
RUN npm install --omit=dev

# Salin hasil kompilasi
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
