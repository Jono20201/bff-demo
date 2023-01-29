import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

import { injectTrpcMiddlware } from './app';

const app = express();

app.options('/*', function (req, res, _) {
    console.log('OPTIONS');
    res.send(200);
});

injectTrpcMiddlware(app);

exports.handler = serverlessExpress({ app });
