FROM node:12.18-alpine as builder
# ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY package.json yarn.lock
RUN yarn
#  && mv node_modules ../
COPY . .
RUN yarn
ENV PATH=$PATH:./node_modules/.bin
RUN echo $PATH

# RUN node_modules/.bin/tsoa spec-and-routes
RUN yarn build
EXPOSE 3001
CMD ["yarn", "start"]

# FROM node:12.18-alpine
# ENV NODE_ENV=production
# WORKDIR /usr/src/app
# RUN chown -R node:node .
# USER node

# COPY package*.json ./
# RUN yarn
# RUN yarn
# COPY --from=builder /usr/src/app/dist/ dist/
# EXPOSE 3001
# CMD ["yarn", "start"]



# FROM node:12-alpine

# RUN mkdir -p /app
# WORKDIR /app

# COPY package.json package.json
# COPY yarn.lock yarn.lock
# RUN yarn
# COPY . .
# RUN yarn build

# # THE LIFE SAVER
# ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
# RUN chmod +x /wait

# # Launch the wait tool and then your application
# CMD yarn start

