# backend/Dockerfile
FROM node:20-slim

# שכבת דפנדנסיז נקייה
WORKDIR /app
ENV NODE_ENV=production
# שמים את cache של npm מחוץ ל-node_modules כדי למנוע EBUSY
ENV NPM_CONFIG_CACHE=/tmp/.npm

# מתקינים רק לפי package*.json (מנצל cache טוב)
COPY package*.json ./
# שימוש ב-npm install כדי להימנע מתלות ב-lockfile לא מסונכרן
RUN npm install --omit=dev

# עכשיו מעתיקים את שאר הקוד
COPY . .

# פורט ה-API
EXPOSE 3000

# פקודת הרצה
CMD ["npm", "start"]

