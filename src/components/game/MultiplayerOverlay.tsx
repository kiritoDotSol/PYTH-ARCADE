import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Plus } from 'lucide-react';
import { socketService } from '../../lib/socket';

interface MultiplayerOverlayProps {
  onClose: () => void;
  availableRooms: { id: string, playerCount: number }[];
}

export const MultiplayerOverlay: React.FC<MultiplayerOverlayProps> = ({ onClose, availableRooms }) => {
  const [newRoomId, setNewRoomId] = React.useState('');

  const handleCreateRoom = () => {
    if (!newRoomId.trim()) return;
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("create-room", newRoomId);
    }
  };

  const handleJoinRoom = (id: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("join-room", id);
    }
  };

  return (
    <motion.div
      key="multiplayer-overlay"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-ink/90 backdrop-blur-md p-4 pointer-events-auto"
    >
      <div className="w-full max-w-md bg-ink border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-purple" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-white italic tracking-tighter mb-8 uppercase">Multiplayer Rooms</h2>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Create New Room</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRoomId}
                onChange={(e) => setNewRoomId(e.target.value)}
                placeholder="ROOM NAME..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/50 transition-all uppercase"
                maxLength={15}
              />
              <button
                onClick={handleCreateRoom}
                className="bg-brand-purple text-white px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase hover:bg-brand-purple/80 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Available Rooms</label>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {availableRooms.length > 0 ? (
                availableRooms.map((room) => (
                  <div 
                    key={room.id}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-purple/30 transition-all group"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-white">{room.id}</span>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{room.playerCount} Players</span>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      className="bg-white/10 text-white px-6 py-2 rounded-xl text-[10px] font-mono font-bold uppercase hover:bg-brand-purple hover:text-white transition-all"
                    >
                      Join
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-white/20 font-mono text-xs uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">
                  No active rooms found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
