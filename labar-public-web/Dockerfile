FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG PUBLIC_SITE_URL
ARG PUBLIC_API_BASE_URL
ARG PUBLIC_APP_ENV=production
ARG PUBLIC_PASSENGER_APP_URL
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL \
    PUBLIC_APP_ENV=$PUBLIC_APP_ENV \
    PUBLIC_PASSENGER_APP_URL=$PUBLIC_PASSENGER_APP_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
