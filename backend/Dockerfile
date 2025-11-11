# backend/Dockerfile
FROM node:20-slim

# שכבת דפנדנסיז נקייה
WORKDIR /app
ENV NODE_ENV=production
# שמים את cache של npm מחוץ ל-node_modules כדי למנוע EBUSY
ENV NPM_CONFIG_CACHE=/tmp/.npm

# מתקינים רק לפי package*.json (מנצל cache טוב)
COPY package*.json ./
RUN npm ci --omit=dev

# מעתיקים את תיקיית DB (אם קיימת) - נדרש למיגרציה
# ב-Railway, תיקיית DB תועתק לתוך backend לפני ה-build
COPY DB ./DB

# עכשיו מעתיקים את שאר הקוד
COPY . .

# פורט ה-API
EXPOSE 3000

# פקודת הרצה
CMD ["npm", "start"]

