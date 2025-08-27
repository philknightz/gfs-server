FROM node:20-alpine
COPY . /server
WORKDIR /server
RUN npm install
CMD ["npm", "start"]