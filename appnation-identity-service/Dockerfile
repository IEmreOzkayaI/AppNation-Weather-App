FROM node:20.10.0-alpine3.18 AS appbuild

WORKDIR /usr/app

RUN npm install -g pnpm

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm prisma:generate
RUN pnpm build


FROM node:20.10.0-alpine3.18 AS release

WORKDIR /usr/app

ENV PNPM_HOME=/usr/app/.pnpm-global
RUN mkdir -p $PNPM_HOME && chmod 777 $PNPM_HOME

RUN addgroup -S appgroup
RUN adduser -S -D -h /usr/app appuser appgroup
RUN chown -R appuser:appgroup /usr/app

USER appuser

COPY --from=appbuild /usr/app/node_modules /usr/app/node_modules
COPY --from=appbuild /usr/app/dist /usr/app/dist
COPY --from=appbuild /usr/app/package.json /usr/app/
COPY --from=appbuild /usr/app/pnpm-lock.yaml /usr/app/

HEALTHCHECK --interval=5s \
            --timeout=5s \
            CMD curl -f http://127.0.0.1:3000 || exit 1

EXPOSE 3000
CMD ["node", "dist/main"]