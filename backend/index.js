import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import friendRoutes from "./routes/friends.js";
import userRoutes from "./routes/users.js";

const app = express();

app.use(cors());
app.use(express.json());

// app.use("/api", authRoutes);
app.use("/api", authRoutes);

app.use("/api/friends", friendRoutes);

app.use("/api/users", userRoutes);

app.listen(5000, () => {
  console.log("sunucu 5000 portunda çalışıyor...");
});
