// index.js starts server
const { app, initializeDatabase } = require('./server');

initializeDatabase()
  .then(() => {
    const server = app.listen(app.get('port'), () => {
      console.log(`Server running at: http://localhost:${app.get('port')}/`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
