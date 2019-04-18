#--------
# BUILD
#--------
FROM node:10-alpine as base

# RUN apk update && apk add yarn
RUN npm i -g yarn

WORKDIR /src
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY . .
RUN npm install
RUN npm run build

##--------
## WEBAPP
##--------
FROM nginx:1.15.5-alpine
COPY --from=base /src/build /src/static.json /app/
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /app
EXPOSE 80