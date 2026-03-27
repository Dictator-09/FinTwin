import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';

const PORT = process.env.PORT || 3001;

import profileRoute from "./routes/profile.js";

app.use("/api", profileRoute);

app.listen(PORT, () => {
  console.log(`FinTwin backend running on port ${PORT}`);
});
