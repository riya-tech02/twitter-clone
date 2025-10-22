"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const tweet_routes_1 = __importDefault(require("./routes/tweet.routes"));
const socketService_1 = require("./services/socketService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
const io = (0, socketService_1.initializeSocket)(httpServer);
app.set('io', io);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tweets', tweet_routes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/twitter-clone';
console.log('Attempting to connect to MongoDB...');
mongoose_1.default.connect(MONGO_URI)
    .then(() => {
    console.log('✓ Connected to MongoDB');
    httpServer.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ Socket.io ready`);
    });
})
    .catch(err => {
    console.error('✗ MongoDB error:', err.message);
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
//# sourceMappingURL=server.js.map