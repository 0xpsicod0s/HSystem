import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/routes.js';
import frontEndRoutes from './routes/frontEndRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URL)
.then(() => app.emit('mongodbConnect'))
.catch(e => console.log('Erro ao conectar ao MongoDB: ', e));

app.use('/', frontEndRoutes);
app.use('/api/', routes);

app.use(express.static(path.join(__dirname, 'public')));

// app.get('*', (req, res) => {
//     console.log('Rota não encontrada, redirecionando para index.html');
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

const PORT = process.env.PORT || 3000;
app.on('mongodbConnect', function() {
    app.listen(PORT, function () {
        console.log('Servidor iniciado');
    });
});