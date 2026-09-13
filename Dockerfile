# --- Stage 1: Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Menyalin package.json
COPY package.json ./

# Install semua dependencies (termasuk TypeScript)
RUN npm install

# Salin seluruh kode proyek
COPY . .

# Mengompilasi TypeScript dengan parameter CLI langsung (Tanpa butuh tsconfig.json)
# Menargetkan ESNext, modul NodeNext (untuk ES Module), dan output ke folder 'dist'
RUN npx tsc --target esnext --module nodenext --outDir ./dist --moduleResolution nodenext ./index.ts

# --- Stage 2: Production Stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./

# Hanya menginstall library utama (express)
RUN npm install --omit=dev

# Menyalin hasil kompilasi dari stage builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
