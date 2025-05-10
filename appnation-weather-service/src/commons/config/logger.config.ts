export const EXCLUDED_LOG_KEYWORDS = ['authorization', 'cookie', 'password', 'host', 'content-length', 'connection', 'accept-encoding', 'cache-control', 'accept'];

export const loggerConfig = {
  pinoHttp: {
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          // Filter out sensitive header data
          headers: Object.fromEntries(Object.entries(request.headers).filter(([key]) => !EXCLUDED_LOG_KEYWORDS.includes(key.toLowerCase()))),
          // Add other request properties you want to log
        };
      },
      // You can add more serializers for other objects (e.g., response, error)
    },
    autoLogging: false,
    customProps: () => ({
      context: 'HTTP',
    }),
    transport: {
      target: 'pino-pretty',
      options: {
        ignore: 'pid,hostname',
        singleLine: true,
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      },
    },
  },
};
