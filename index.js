// index.js starts server
const { app } = require('./server');

app.listen(app.get('port'), () => {
  console.log(`Server running at: http://localhost:${app.get('port')}/`);
});
