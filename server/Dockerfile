FROM node:18-alpine

# ตั้งค่า working directory
WORKDIR /app

# ติดตั้ง global dependencies
RUN npm install -g @strapi/strapi@latest

# Copy package.json และ package-lock.json
COPY ./package*.json ./

# ติดตั้ง dependencies
RUN npm install

# Copy โปรเจคทั้งหมด
COPY . .

# ตั้งค่า environment variables
ENV NODE_ENV=production
ENV DATABASE_CLIENT=sqlite
ENV PORT=1337
ENV HOST=0.0.0.0

# สร้าง build สำหรับ production
RUN npm run build

# เปิด port 1337
EXPOSE 1337

# รัน Strapi
CMD ["npm", "run", "start"]