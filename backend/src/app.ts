import express from 'express';
import * as Routes from './routes';

const app = express();

app.use(express.json());
app.use('/api/burn', Routes.burnRoutes);
app.use('/api/mint', Routes.mintRoutes);
app.use('/api/price', Routes.priceRoutes);
app.use('/api/swap', Routes.swapRoutes);
app.use('/api/sync', Routes.syncRoutes);
app.use('/api/volume', Routes.volumeRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
    }
);

export default app;
