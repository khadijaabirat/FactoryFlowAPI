const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'FactoryFlow API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', apiRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
