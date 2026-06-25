import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import analysisRouter from './routes/analysis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Render.com's proxy so express-rate-limit reads the real client IP
// from X-Forwarded-For instead of the shared load-balancer IP.
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    "https://ideabridge-six.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.options("*", cors());

app.use(express.json());
app.use(helmet());

// Routes
app.use('/api', analysisRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: "Something went wrong."
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
