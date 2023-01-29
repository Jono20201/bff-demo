import express from 'express';

import { injectTrpcMiddlware } from './app';

const app = express();
app.options('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With',
    );
    res.send(200);
});
injectTrpcMiddlware(app);
app.listen(4000);
