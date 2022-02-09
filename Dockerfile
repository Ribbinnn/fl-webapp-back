FROM node:14.15.0
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD [ "npm", "start" ]

# FROM node:14.15.0
# WORKDIR /usr/src/app

# COPY . .

# RUN npm config rm proxy
# RUN npm config rm https-proxy
# RUN npm install back-modules-0.0.0.tgz

# EXPOSE 5000

# CMD [ "npm", "start" ]