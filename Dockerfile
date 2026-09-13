# --- Stage 1: Build Stage ---
FROM node:22-alpine AS builder

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Salin berkas package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install semua dependencies (termasuk devDependencies untuk kompilasi TypeScript)
RUN npm ci

# Salin seluruh kode sumber aplikasi
COPY . .

# Kompilasi TypeScript ke JavaScript (Pastikan Anda memiliki skrip "build" di package.json, misal: "tsc")
RUN npm run build

# --- Stage 2: Production Stage ---
FROM node:22-alpine AS runner

WORKDIR /app

# Atur environment ke production
ENV NODE_ENV=production

# Salin package.json untuk mendeteksi mode ES Module ("type": "module")
COPY package*.json ./

# Hanya install dependencies produksi (express), tanpa devDependencies (typescript, types)
RUN npm ci --only=production

# Salin hasil kompilasi JavaScript dari stage builder
# Sesuaikan 'dist' dengan folder output di tsconfig.json Anda (biasanya 'dist' atau 'build')
COPY --from=builder /app/dist ./dist

# Ekspos port yang digunakan oleh Express (misal: 3000)
EXPOSE 3000

# Jalankan aplikasi Express Anda
CMD ["node", "dist/index.js"]
