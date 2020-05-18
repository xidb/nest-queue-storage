FROM rocketoltd/commonimgs:nodejs-12.16.0

ENV NODE_ENV development

RUN npm install

CMD [ 'npm', 'run', 'start:dev' ]
