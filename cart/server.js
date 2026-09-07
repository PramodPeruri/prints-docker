'use strict';

const redis = require('redis');
const request = require('request');
const bodyParser = require('body-parser');
const express = require('express');
const pino = require('pino');
const expPino = require('express-pino-logger');

let redisConnected = false;
const redisHost = process.env.REDIS_HOST || 'redis';
const catalogueHost = process.env.CATALOGUE_HOST || 'catalogue';
const cataloguePort = process.env.CATALOGUE_PORT || '8080';

const logger = pino({ level: 'info', prettyPrint: false });
const expLogger = expPino({ logger });

const app = express();
app.use(expLogger);
app.use((req, res, next) => {
    res.set('Timing-Allow-Origin', '*');
    res.set('Access-Control-Allow-Origin', '*');
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({ app: 'OK', redis: redisConnected }));

// Get cart
app.get('/cart/:id', (req, res) => {
    redisClient.get(req.params.id, (err, data) => {
        if (err) return res.status(500).send(err);
        if (data == null) return res.status(404).send('cart not found');
        res.set('Content-Type', 'application/json');
        res.send(data);
    });
});

// Delete cart
app.delete('/cart/:id', (req, res) => {
    redisClient.del(req.params.id, (err, data) => {
        if (err) return res.status(500).send(err);
        if (data == 1) res.send('OK');
        else res.status(404).send('cart not found');
    });
});

// Rename cart (on login)
app.get('/rename/:from/:to', (req, res) => {
    redisClient.get(req.params.from, (err, data) => {
        if (err) return res.status(500).send(err);
        if (data == null) return res.status(404).send('cart not found');
        const cart = JSON.parse(data);
        saveCart(req.params.to, cart)
            .then(() => res.json(cart))
            .catch(e => res.status(500).send(e));
    });
});

// Add item to cart
app.get('/add/:id/:sku/:qty', (req, res) => {
    const qty = parseInt(req.params.qty);
    if (isNaN(qty) || qty < 1) return res.status(400).send('quantity must be a positive number');

    getProduct(req.params.sku).then(product => {
        if (!product) return res.status(404).send('product not found');
        if (product.instock == 0) return res.status(404).send('out of stock');

        redisClient.get(req.params.id, (err, data) => {
            if (err) return res.status(500).send(err);
            const cart = data == null ? { total: 0, tax: 0, items: [] } : JSON.parse(data);
            const item = { qty, sku: req.params.sku, name: product.name, price: product.price, subtotal: qty * product.price };
            cart.items = mergeList(cart.items, item, qty);
            cart.total = calcTotal(cart.items);
            cart.tax = calcTax(cart.total);
            saveCart(req.params.id, cart)
                .then(() => res.json(cart))
                .catch(e => res.status(500).send(e));
        });
    }).catch(e => res.status(500).send(e));
});

// Update item quantity (0 = remove)
app.get('/update/:id/:sku/:qty', (req, res) => {
    const qty = parseInt(req.params.qty);
    if (isNaN(qty) || qty < 0) return res.status(400).send('invalid quantity');

    redisClient.get(req.params.id, (err, data) => {
        if (err) return res.status(500).send(err);
        if (data == null) return res.status(404).send('cart not found');
        const cart = JSON.parse(data);
        const idx = cart.items.findIndex(i => i.sku == req.params.sku);
        if (idx === -1) return res.status(404).send('item not in cart');
        if (qty == 0) cart.items.splice(idx, 1);
        else { cart.items[idx].qty = qty; cart.items[idx].subtotal = cart.items[idx].price * qty; }
        cart.total = calcTotal(cart.items);
        cart.tax = calcTax(cart.total);
        saveCart(req.params.id, cart)
            .then(() => res.json(cart))
            .catch(e => res.status(500).send(e));
    });
});

// Add shipping to cart
app.post('/shipping/:id', (req, res) => {
    const shipping = req.body;
    if (!shipping.distance || !shipping.cost || !shipping.location)
        return res.status(400).send('shipping data missing');

    redisClient.get(req.params.id, (err, data) => {
        if (err) return res.status(500).send(err);
        if (data == null) return res.status(404).send('cart not found');
        const cart = JSON.parse(data);
        const item = { qty: 1, sku: 'SHIP', name: 'Shipping to ' + shipping.location, price: shipping.cost, subtotal: shipping.cost };
        const idx = cart.items.findIndex(i => i.sku === 'SHIP');
        if (idx === -1) cart.items.push(item); else cart.items[idx] = item;
        cart.total = calcTotal(cart.items);
        cart.tax = calcTax(cart.total);
        saveCart(req.params.id, cart)
            .then(() => res.json(cart))
            .catch(e => res.status(500).send(e));
    });
});

function mergeList(list, product, qty) {
    const idx = list.findIndex(i => i.sku == product.sku);
    if (idx !== -1) { list[idx].qty += qty; list[idx].subtotal = list[idx].price * list[idx].qty; }
    else list.push(product);
    return list;
}
function calcTotal(list) { return list.reduce((t, i) => t + i.subtotal, 0); }
function calcTax(total) { return +(total - total / 1.2).toFixed(2); }

function getProduct(sku) {
    return new Promise((resolve, reject) => {
        request(`http://${catalogueHost}:${cataloguePort}/product/${sku}`, (err, res, body) => {
            if (err) reject(err);
            else if (res.statusCode != 200) resolve(null);
            else resolve(JSON.parse(body));
        });
    });
}
function saveCart(id, cart) {
    return new Promise((resolve, reject) => {
        redisClient.setex(id, 3600, JSON.stringify(cart), (err, data) => {
            if (err) reject(err); else resolve(data);
        });
    });
}

const redisClient = redis.createClient({ host: redisHost });
redisClient.on('error', e => logger.error('Redis ERROR', e));
redisClient.on('ready', () => { logger.info('Redis READY'); redisConnected = true; });

const port = process.env.CART_SERVER_PORT || '8080';
app.listen(port, () => logger.info('Cart service listening on port ' + port));


process.on('SIGINT',()=>process.exit(0));
process.on('SIGTERM',()=>process.exit(0));
