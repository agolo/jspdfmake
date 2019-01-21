#--------
# BUILD
#--------
FROM node:10-alpine as base

# RUN apk update && apk add yarn
RUN npm i -g yarn

WORKDIR /src
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY . .
ARG REACT_APP_COHERENCE_API_URL
ARG REACT_APP_USER_MANAGEMENT_API_URL
ARG REACT_APP_NODE_SUMM_API_URL
ARG REACT_APP_ENV_NAME
RUN yarn install --production
RUN yarn build

##--------
## WEBAPP
##--------
FROM nginx:1.15.5-alpine
COPY --from=base /src/build /src/static.json /app/
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /app
EXPOSE 80