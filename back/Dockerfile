FROM node:18-alpine

RUN adduser -D app

USER app
WORKDIR /app

COPY --chown=app:app package*.json ./
RUN npm install

COPY --chown=app:app . .

EXPOSE 5000
CMD ["npm", "start"]
