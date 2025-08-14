ARG NGINX_VERSION=mainline
FROM nginx:$NGINX_VERSION
ARG BUILD_FOLDER=dist

ENV APPLICATION_PORT=80
ENV NGINX_ROOT_DOCUMENT=/var/www/html

WORKDIR $NGINX_ROOT_DOCUMENT

COPY $BUILD_FOLDER $NGINX_ROOT_DOCUMENT
COPY .docker/nginx.template.conf /etc/nginx/templates/default.conf.template

EXPOSE ${APPLICATION_PORT}/tcp

HEALTHCHECK --interval=2m --timeout=3s \
  CMD curl -f http://localhost:${APPLICATION_PORT} || exit 1
