'use strict';

const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const express = require('express');
const pino = require('pino');
const expPino = require('express-pino-logger');

const logger = pino({ level: 'info', prettyPrint: false });
const expLogger = expPino({ logger });

let db, collection;
let mongoConnected = false;

const app = express();
app.use(expLogger);
app.use((req, res, next) => {
    res.set('Timing-Allow-Origin', '*');
    res.set('Access-Control-Allow-Origin', '*');
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({ app: 'OK', mongo: mongoConnected }));

// All products
app.get('/products', (req, res) => {
    if (!mongoConnected) return res.status(500).send('database not available');
    collection.find({}).toArray()
        .then(p => res.json(p))
        .catch(e => res.status(500).send(e));
});

// Products by category: home | office | kids | industrial | custom
app.get('/products/:category', (req, res) => {
    if (!mongoConnected) return res.status(500).send('database not available');
    collection.find({ categories: req.params.category }).toArray()
        .then(p => res.json(p))
        .catch(e => res.status(500).send(e));
});

// Product by SKU
app.get('/product/:sku', (req, res) => {
    if (!mongoConnected) return res.status(500).send('database not available');
    const delay = process.env.GO_SLOW || 0;
    setTimeout(() => {
        collection.findOne({ sku: req.params.sku })
            .then(p => p ? res.json(p) : res.status(404).send('SKU not found'))
            .catch(e => res.status(500).send(e));
    }, delay);
});

// Full-text search
app.get('/search/:text', (req, res) => {
    if (!mongoConnected) return res.status(500).send('database not available');
    collection.find({ '$text': { '$search': req.params.text } }).toArray()
        .then(p => res.json(p))
        .catch(e => res.status(500).send(e));
});

// Distinct categories
app.get('/categories', (req, res) => {
    if (!mongoConnected) return res.status(500).send('database not available');
    collection.distinct('categories')
        .then(cats => res.json(cats))
        .catch(e => res.status(500).send(e));
});

const mongoHost = process.env.MONGO_HOST || 'mongodb';
const mongoPort = process.env.MONGO_PORT || '27017';

MongoClient.connect(`mongodb://${mongoHost}:${mongoPort}/`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
}).then(client => {
    db = client.db('catalogue');
    collection = db.collection('products');
    mongoConnected = true;
    logger.info('MongoDB connected');
}).catch(e => logger.error('MongoDB connection error', e));

const port = process.env.CATALOGUE_SERVER_PORT || '8080';
app.listen(port, () => logger.info('Catalogue service listening on port ' + port));


process.on("SIGTERM",()=>process.exit(0));
process.on("SIGINT",()=>process.exit(0));
