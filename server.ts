import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Leaderboard mock data
  const leaderboard = [
    { name: "AGENT_X", score: 950000, rank: "LEGEND" },
    { name: "PYTH_MASTER", score: 820000, rank: "PRO" },
    { name: "BULL_RUNNER", score: 710000, rank: "PRO" },
    { name: "CRYPTO_KING", score: 650000, rank: "ELITE" },
    { name: "ORACLE_EYE", score: 580000, rank: "ELITE" },
  ];

  // API routes
  app.get("/api/leaderboard", (req, res) => {
    res.json(leaderboard);
  });

  app.get("/api/profile/:id", (req, res) => {
    res.json({
      id: req.params.id,
      name: "AGENT_001",
      rank: "NOVICE",
      score: 12500,
      xp: 1250,
      achievements: ["FIRST_COIN", "SLICE_MASTER"]
    });
  });

  // Room management
  const rooms = new Map<string, Set<string>>(); // roomId -> Set of socketIds

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("get-rooms", () => {
      const availableRooms = Array.from(rooms.keys()).map(id => ({
        id,
        playerCount: rooms.get(id)?.size || 0
      }));
      socket.emit("rooms-list", availableRooms);
    });

    socket.on("create-room", (roomId: string) => {
      if (rooms.has(roomId)) {
        socket.emit("error", "Room already exists");
        return;
      }
      rooms.set(roomId, new Set([socket.id]));
      socket.join(roomId);
      socket.emit("room-joined", roomId);
      io.emit("rooms-list", Array.from(rooms.keys()).map(id => ({
        id,
        playerCount: rooms.get(id)?.size || 0
      })));
    });

    socket.on("join-room", (roomId: string) => {
      if (!rooms.has(roomId)) {
        socket.emit("error", "Room does not exist");
        return;
      }
      rooms.get(roomId)?.add(socket.id);
      socket.join(roomId);
      socket.emit("room-joined", roomId);
      io.emit("rooms-list", Array.from(rooms.keys()).map(id => ({
        id,
        playerCount: rooms.get(id)?.size || 0
      })));
    });

    socket.on("leave-room", (roomId: string) => {
      if (rooms.has(roomId)) {
        rooms.get(roomId)?.delete(socket.id);
        if (rooms.get(roomId)?.size === 0) {
          rooms.delete(roomId);
        }
        socket.leave(roomId);
        socket.to(roomId).emit("player-left", socket.id);
      }
      io.emit("rooms-list", Array.from(rooms.keys()).map(id => ({
        id,
        playerCount: rooms.get(id)?.size || 0
      })));
    });

    socket.on("player-state", (data: { roomId: string, state: any }) => {
      socket.to(data.roomId).emit("remote-player-state", {
        playerId: socket.id,
        state: data.state
      });
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (rooms.has(roomId)) {
          rooms.get(roomId)?.delete(socket.id);
          if (rooms.get(roomId)?.size === 0) {
            rooms.delete(roomId);
          }
          socket.to(roomId).emit("player-left", socket.id);
        }
      }
      io.emit("rooms-list", Array.from(rooms.keys()).map(id => ({
        id,
        playerCount: rooms.get(id)?.size || 0
      })));
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
