FROM node:20

WORKDIR /usr/src/app

# RUN apt-get update && \
#     apt-get install -y software-properties-common && \
#     add-apt-repository ppa:savoury1/ffmpeg4 && \
#     apt-get install -y ffmpeg

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

CMD ["node", "dist/main.js"]