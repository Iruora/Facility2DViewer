import { useState, useRef, useEffect } from "react";
import { fetchRooms } from "../api/roomsApi";
import { fetchMachines, createMachine, deleteMachine, updateMachine } from "../api/machinesApi";
import type { Room } from "../api/roomsApi";
import type { Machine } from "../api/machinesApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";



export default function FacilityPlan() {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  useEffect(() => {
    Promise.all([fetchRooms(), fetchMachines()]).then(([roomsData, machinesData]) => {
      setRooms(roomsData);
      setMachines(machinesData);
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
    if (hasDragged) return;
    
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
    if (e.button === 0 && !isAddingMachine) {
      setIsPanning(true);
      setHasDragged(false);
      setPanStart({ x: e.clientX, y: e.clientY });
      const [x, y, width, height] = viewBox.split(' ').map(Number);
      setViewBoxStart({ x, y, width, height });
    }
  };

  const handleSvgClick = (e: React.MouseEvent) => {
    if (!isAddingMachine || !selectedRoom || hasDragged) return;
    
    const svg = svgRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);
    
    const x = ((e.clientX - rect.left) / rect.width) * vbWidth + vbX - 95.52219;
    const y = ((e.clientY - rect.top) / rect.height) * vbHeight + vbY + 1.1547294;
    
    if (newMachineName.trim()) {
      createMachine({
        name: newMachineName,
        roomId: selectedRoom.id,
        x,
        y,
        status: 'free'
      }).then(machine => {
        setMachines(prev => [...prev, machine]);
        setNewMachineName('');
        setIsAddingMachine(false);
      });
    }
  };

  const handleDeleteMachine = (machineId: string) => {
    deleteMachine(machineId).then(() => {
      setMachines(prev => prev.filter(m => m._id !== machineId));
    });
  };

  const handleMachineStatusChange = (machineId: string, status: 'free' | 'occupied' | 'broken') => {
    updateMachine(machineId, { status }).then(updatedMachine => {
      setMachines(prev => prev.map(m => m._id === machineId ? updatedMachine : m));
    });
  };

  const getMachineColor = (status: string) => {
    switch (status) {
      case 'free': return '#10B981';
      case 'occupied': return '#EF4444';
      case 'broken': return '#6B7280';
      default: return '#10B981';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || isAddingMachine) return;
    
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
          onMouseDown={isAddingMachine ? undefined : handleMouseDown}
          onMouseMove={isAddingMachine ? undefined : handleMouseMove}
          onMouseUp={isAddingMachine ? undefined : handleMouseUp}
          onMouseLeave={isAddingMachine ? undefined : handleMouseUp}
          onClick={isAddingMachine ? handleSvgClick : undefined}
          style={{ cursor: isAddingMachine ? 'crosshair' : 'default' }}
        >
          <rect
            width="100%"
            height="100%"
            fill="transparent"
            style={{ cursor: isAddingMachine ? 'crosshair' : (isPanning ? 'grabbing' : 'grab') }}
          />
          <g transform="translate(95.52219,-1.1547294)">
            {rooms.map(room => {
              const isHovered = hoveredRoom === room.id;
              const isFlashing = flashingRoom === room.id;
              const isSelected = selectedRoom?.id === room.id;
              
              let fillColor = "#D1D5DB";
              if (isSelected) fillColor = "#10B981";
              else if (isHovered) fillColor = "#60A5FA";
              
              const centerX = room.bbox.x + room.bbox.width / 2;
              const centerY = room.bbox.y + room.bbox.height / 2;
              
              return (
                <g key={room.id}>
                  <path
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
                    onClick={() => !hasDragged && handleRoomClick(room.id)}
                    d={room.path}
                  />
                  <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="3"
                    fill="#000"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {room.name}
                  </text>
                </g>
              );
            })}
            
            {/* Machines */}
            {machines.map(machine => (
              <g key={machine._id}>
                <rect
                  x={machine.x - 2}
                  y={machine.y - 2}
                  width="4"
                  height="4"
                  fill={getMachineColor(machine.status)}
                  stroke="#000"
                  strokeWidth="0.2"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMachine(machine);
                  }}
                >
                  <title>{`${machine.name} (${machine.status})`}</title>
                </rect>
                {machine.status === 'broken' && (
                  <g>
                    <line x1={machine.x - 1.5} y1={machine.y - 1.5} x2={machine.x + 1.5} y2={machine.y + 1.5} stroke="#000" strokeWidth="0.3" />
                    <line x1={machine.x - 1.5} y1={machine.y + 1.5} x2={machine.x + 1.5} y2={machine.y - 1.5} stroke="#000" strokeWidth="0.3" />
                  </g>
                )}
              </g>
            ))}
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
          <div className="space-y-4">
            <div className="p-3 rounded-xl shadow bg-gray-50">
              <p className="text-sm text-gray-600">Selected Room</p>
              <p className="text-xl font-semibold">{selectedRoom.name}</p>
              <p className="text-xs text-gray-500">ID: {selectedRoom.id}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Machines</h3>
              {machines.filter(m => m.roomId === selectedRoom.id).map(machine => (
                <div key={machine._id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${
                      machine.status === 'free' ? 'bg-green-500' : 
                      machine.status === 'occupied' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm">{machine.name}</span>
                    <span className="text-xs text-gray-500">({machine.status})</span>
                  </div>
                  <div className="flex gap-1">
                    <select
                      value={machine.status}
                      onChange={(e) => handleMachineStatusChange(machine._id!, e.target.value as any)}
                      className="text-xs p-1 border rounded"
                    >
                      <option value="free">Free</option>
                      <option value="occupied">Occupied</option>
                      <option value="broken">Broken</option>
                    </select>
                    <button
                      onClick={() => handleDeleteMachine(machine._id!)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              {isAddingMachine ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Machine name"
                    value={newMachineName}
                    onChange={(e) => setNewMachineName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMachineName.trim()) {
                        // Ready to place - just need to click on room
                      }
                    }}
                    className="w-full p-2 border rounded"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsAddingMachine(false);
                        setNewMachineName('');
                      }}
                      className="px-3 py-1 bg-gray-300 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Click on the room to place the machine</p>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingMachine(true)}
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Machine
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 italic">Click a room to see details.</p>
        )}
      </div>

      {/* Machine Dialog */}
      <Dialog open={!!selectedMachine} onOpenChange={() => setSelectedMachine(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMachine?.name}</DialogTitle>
          </DialogHeader>
          {selectedMachine && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <div className={`w-3 h-3 rounded ${
                  selectedMachine.status === 'free' ? 'bg-green-500' : 
                  selectedMachine.status === 'occupied' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-sm font-medium capitalize">{selectedMachine.status}</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Change Status:</label>
                <Select
                  value={selectedMachine.status}
                  onValueChange={(value: 'free' | 'occupied' | 'broken') => {
                    handleMachineStatusChange(selectedMachine._id!, value);
                    setSelectedMachine({...selectedMachine, status: value});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="broken">Broken</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm(`Delete machine ${selectedMachine.name}?`)) {
                      handleDeleteMachine(selectedMachine._id!);
                      setSelectedMachine(null);
                    }
                  }}
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedMachine(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
