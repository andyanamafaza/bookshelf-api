const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
  try {
    const server = Hapi.server({
      port: 9000,
      host: 'localhost',
      routes: {
        cors: {
          origin: ['*'],
        },
      },
    });

    server.route(routes);

    await server.start();
  } catch (error) {
    process.exit(1);
  }
};

init();
