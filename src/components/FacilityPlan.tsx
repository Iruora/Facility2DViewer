import { useState, useRef, useEffect } from "react";
import { fetchRooms } from "../api/roomsApi";
import type { Room } from "../api/roomsApi";



export default function FacilityPlan() {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms().then(roomsData => {
      setRooms(roomsData);
      setLoading(false);
    });
  }, []);
  const [viewBox, setViewBox] = useState<string>("0 0 285.43249 257.8024");
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [viewBoxStart, setViewBoxStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [flashingRoom, setFlashingRoom] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const handleRoomClick = (roomId: string) => {
    const roomData = rooms.find((r) => r.id === roomId);
    if (!roomData) return;

    setSelectedRoom(roomData);

    const room = rooms.find(r => r.id === roomId);
    if (room?.bbox) {
      const bbox = room.bbox;
      const padding = 20;
      // Account for the transform="translate(95.52219,-1.1547294)"
      const x = bbox.x + 95.52219 - padding;
      const y = bbox.y - 1.1547294 - padding;
      const width = bbox.width + padding * 2;
      const height = bbox.height + padding * 2;

      setViewBox(`${x} ${y} ${width} ${height}`);
      
      // Flash the selected room
      setFlashingRoom(roomId);
      setTimeout(() => setFlashingRoom(null), 1000);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setHasDragged(false);
      setPanStart({ x: e.clientX, y: e.clientY });
      const [x, y, width, height] = viewBox.split(' ').map(Number);
      setViewBoxStart({ x, y, width, height });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    
    const dx = Math.abs(e.clientX - panStart.x);
    const dy = Math.abs(e.clientY - panStart.y);
    
    if (dx > 3 || dy > 3) {
      setHasDragged(true);
      const deltaX = (e.clientX - panStart.x) * (viewBoxStart.width / (svgRef.current?.clientWidth || 1));
      const deltaY = (e.clientY - panStart.y) * (viewBoxStart.height / (svgRef.current?.clientHeight || 1));
      
      const newX = viewBoxStart.x - deltaX;
      const newY = viewBoxStart.y - deltaY;
      
      setViewBox(`${newX} ${newY} ${viewBoxStart.width} ${viewBoxStart.height}`);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const zoomIn = () => {
    const [x, y, width, height] = viewBox.split(' ').map(Number);
    const newWidth = width * 0.8;
    const newHeight = height * 0.8;
    const newX = x + (width - newWidth) / 2;
    const newY = y + (height - newHeight) / 2;
    setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
  };

  const zoomOut = () => {
    const [x, y, width, height] = viewBox.split(' ').map(Number);
    const newWidth = width * 1.25;
    const newHeight = height * 1.25;
    const newX = x - (newWidth - width) / 2;
    const newY = y - (newHeight - height) / 2;
    setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
  };

  const resetView = () => {
    setViewBox("0 0 285.43249 257.8024");
    setSelectedRoom(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-xl">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex p-8">
      {/* Floor Plan */}
      <div className="flex-1 border-2 border-gray-400 rounded-lg shadow-xl bg-gray-50 mr-4 p-4">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <rect
            width="100%"
            height="100%"
            fill="transparent"
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          />
          <g transform="translate(95.52219,-1.1547294)">
            {rooms.map(room => {
              const isHovered = hoveredRoom === room.id;
              const isFlashing = flashingRoom === room.id;
              const isSelected = selectedRoom?.id === room.id;
              
              let fillColor = "#D1D5DB";
              if (isSelected) fillColor = "#10B981";
              else if (isHovered) fillColor = "#60A5FA";
              
              return (
                <path
                  key={room.id}
                  id={room.id}
                  fill={fillColor}
                  stroke="#000000"
                  strokeWidth="0.529696"
                  style={{ 
                    cursor: "pointer", 
                    transition: "fill 0.2s ease-in-out",
                    animation: isFlashing ? "flash 1s ease-in-out" : "none"
                  }}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  onClick={() => handleRoomClick(room.id)}
                  d={room.path}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Zoom Controls */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50 p-4 bg-white rounded-2xl shadow-xl m-5" style={{ margin: '20px' }}>
        <button
          className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 rounded-full shadow-lg flex items-center justify-center text-xl font-bold text-white hover:shadow-xl transition-all transform hover:scale-105"
          onClick={zoomIn}
        >
          +
        </button>
        <button
          className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 rounded-full shadow-lg flex items-center justify-center text-xl font-bold text-white hover:shadow-xl transition-all transform hover:scale-105"
          onClick={zoomOut}
        >
          −
        </button>
        <button
          className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 rounded-full shadow-lg flex items-center justify-center text-lg font-bold text-white hover:shadow-xl transition-all transform hover:scale-105"
          onClick={resetView}
        >
          ⌂
        </button>
      </div>

      {/* Side Panel */}
      <div className="w-80 border border-gray-300 rounded-lg shadow-lg p-4 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">Room Details</h2>

        {selectedRoom ? (
          <div className="p-3 rounded-xl shadow bg-gray-50">
            <p className="text-sm text-gray-600">Selected Room</p>
            <p className="text-xl font-semibold">{selectedRoom.name}</p>
            <p className="text-xs text-gray-500">ID: {selectedRoom.id}</p>
          </div>
        ) : (
          <p className="text-gray-400 italic">Click a room to see details.</p>
        )}
      </div>
    </div>
  );
}
