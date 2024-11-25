require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const TOKEN = process.env.TOKEN;
// Allowed requests
const allowedRequests = [
    '/Users/:userId/Items',
    '/Sessions',
    '/Items/:movieId/Images/Backdrop/0',
    '/Items/:movieId/Images/Logo',
];

app.use((req, res, next) => {
    const isAllowed = allowedRequests.some(route => {
        const regex = new RegExp(route.replace(/:\w+/g, '\\w+'));
        return regex.test(req.path);
    });

    if (isAllowed) {
        req.headers['Authorization'] = `MediaBrowser Client="Jellyfin Web", Token="${TOKEN}"`;
        next();
    } else {
        res.status(403).send('Forbidden');
    }
});

app.use('/api', (req, res) => {
    const url = `http://192.168.1.45:8096${req.originalUrl}`;
    axios({
        method: req.method,
        url: url,
        headers: req.headers,
        data: req.body,
    })
    .then(response => res.json(response.data))
    .catch(error => res.status(error.response.status).send(error.response.data));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
