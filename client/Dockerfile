# Build Stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# Copy โปรเจคทั้งหมด
COPY . .

# สร้าง build สำหรับ production
RUN npm run build

# Production Stage with Nginx
FROM nginx:alpine

# Copy build จาก build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy ไฟล์ nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# เปิด port 80
EXPOSE 80

# รัน nginx
CMD ["nginx", "-g", "daemon off;"]