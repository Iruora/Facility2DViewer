import { useState, useRef, useEffect } from "react";
import { fetchRooms } from "../api/roomsApi";
import { fetchMachines, createMachine, deleteMachine, updateMachine } from "../api/machinesApi";
import type { Room } from "../api/roomsApi";
import type { Machine } from "../api/machinesApi";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  Card,
  CardContent,
  TextField,
  Fab,
  CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  ZoomIn,
  ZoomOut,
  Home,
  Settings
} from '@mui/icons-material';

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
      const x = bbox.x + 95.52219 - padding;
      const y = bbox.y - 1.1547294 - padding;
      const width = bbox.width + padding * 2;
      const height = bbox.height + padding * 2;

      setViewBox(`${x} ${y} ${width} ${height}`);
      
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
      case 'free': return '#4caf50';
      case 'occupied': return '#ff9800';
      case 'broken': return '#f44336';
      default: return '#4caf50';
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
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#fafafa'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#1976d2', mb: 2 }} />
          <Typography variant="h6" color="text.primary">Loading Facility Management System...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      p: 2, 
      background: '#fafafa',
      gap: 2
    }}>
      <Paper sx={{ 
        flex: 1, 
        borderRadius: 1, 
        background: '#ffffff',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        border: '1px solid #e0e0e0'
      }}>
        <svg
          ref={svgRef}
          viewBox={viewBox}
          style={{ width: '100%', height: '100%' }}
          onMouseDown={isAddingMachine ? undefined : handleMouseDown}
          onMouseMove={isAddingMachine ? undefined : handleMouseMove}
          onMouseUp={isAddingMachine ? undefined : handleMouseUp}
          onMouseLeave={isAddingMachine ? undefined : handleMouseUp}
          onClick={isAddingMachine ? handleSvgClick : undefined}
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
              
              let fillColor = "#f5f5f5";
              if (isSelected) fillColor = "#e3f2fd";
              else if (isHovered) fillColor = "#fff3e0";
              
              const centerX = room.bbox.x + room.bbox.width / 2;
              const centerY = room.bbox.y + room.bbox.height / 2;
              
              return (
                <g key={room.id}>
                  <path
                    id={room.id}
                    fill={fillColor}
                    stroke="#424242"
                    strokeWidth="0.5"
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
                    fontSize="2.5"
                    fill="#424242"
                    style={{ pointerEvents: "none", userSelect: "none", fontFamily: 'Roboto, sans-serif' }}
                  >
                    {room.name}
                  </text>
                </g>
              );
            })}
            
            {machines.map(machine => (
              <g key={machine._id}>
                <rect
                  x={machine.x - 2}
                  y={machine.y - 2}
                  width="4"
                  height="4"
                  fill={getMachineColor(machine.status)}
                  stroke="#424242"
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
                    <line x1={machine.x - 1.5} y1={machine.y - 1.5} x2={machine.x + 1.5} y2={machine.y + 1.5} stroke="#424242" strokeWidth="0.3" />
                    <line x1={machine.x - 1.5} y1={machine.y + 1.5} x2={machine.x + 1.5} y2={machine.y - 1.5} stroke="#424242" strokeWidth="0.3" />
                  </g>
                )}
              </g>
            ))}
          </g>
        </svg>
      </Paper>

      <Box sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1, 
        zIndex: 1000 
      }}>
        <Fab size="small" onClick={zoomIn} sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}>
          <ZoomIn />
        </Fab>
        <Fab size="small" onClick={zoomOut} sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}>
          <ZoomOut />
        </Fab>
        <Fab size="small" onClick={resetView} sx={{ bgcolor: '#757575', '&:hover': { bgcolor: '#616161' } }}>
          <Home />
        </Fab>
      </Box>

      <Paper sx={{ 
        width: 380, 
        borderRadius: 1, 
        background: '#ffffff',
        p: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        border: '1px solid #e0e0e0'
      }}>
        <Typography variant="h5" sx={{ 
          mb: 3, 
          color: '#1976d2',
          fontWeight: 500,
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}>
          Facility Management
        </Typography>

        {selectedRoom ? (
          <Box>
            <Card sx={{ mb: 3, bgcolor: '#1976d2', color: 'white' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>Selected Room</Typography>
                <Typography variant="h6" sx={{ fontWeight: 500, my: 0.5 }}>{selectedRoom.name}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>ID: {selectedRoom.id}</Typography>
              </CardContent>
            </Card>
            
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#424242', fontWeight: 500 }}>
              <Settings color="primary" /> Equipment
            </Typography>
            
            {machines.filter(m => m.roomId === selectedRoom.id).map(machine => (
              <Card key={machine._id} sx={{ mb: 1.5, '&:hover': { boxShadow: 2 }, transition: 'all 0.2s', border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip 
                        size="small" 
                        label={machine.status}
                        color={machine.status === 'free' ? 'success' : machine.status === 'occupied' ? 'warning' : 'error'}
                        variant="outlined"
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{machine.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 90 }}>
                        <Select
                          value={machine.status}
                          onChange={(e) => handleMachineStatusChange(machine._id!, e.target.value as any)}
                          size="small"
                          variant="outlined"
                        >
                          <MenuItem value="free">Available</MenuItem>
                          <MenuItem value="occupied">In Use</MenuItem>
                          <MenuItem value="broken">Maintenance</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton size="small" color="error" onClick={() => handleDeleteMachine(machine._id!)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            {isAddingMachine ? (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Equipment Name"
                  value={newMachineName}
                  onChange={(e) => setNewMachineName(e.target.value)}
                  autoFocus
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsAddingMachine(false);
                    setNewMachineName('');
                  }}
                >
                  Cancel
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Click on the room to place the equipment
                </Typography>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddingMachine(true)}
                sx={{ 
                  mt: 2,
                  bgcolor: '#1976d2',
                  '&:hover': { bgcolor: '#1565c0' },
                  py: 1.5,
                  fontWeight: 500
                }}
              >
                Add Equipment
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Settings sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>Select a Room</Typography>
            <Typography variant="body2" color="text.disabled">Click on any room to view and manage equipment</Typography>
          </Box>
        )}
      </Paper>

      <Dialog 
        open={!!selectedMachine} 
        onClose={() => setSelectedMachine(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          pb: 1, 
          bgcolor: '#f5f5f5', 
          borderBottom: '1px solid #e0e0e0',
          color: '#1976d2',
          fontWeight: 500
        }}>
          <Settings color="primary" />
          {selectedMachine?.name}
          <IconButton 
            onClick={() => setSelectedMachine(null)}
            sx={{ ml: 'auto' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedMachine && (
            <Box>
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Current Status</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={selectedMachine.status}
                    color={selectedMachine.status === 'free' ? 'success' : selectedMachine.status === 'occupied' ? 'warning' : 'error'}
                    size="small"
                  />
                  <Typography variant="h6" color="text.primary" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                    {selectedMachine.status}
                  </Typography>
                </Box>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Update Status</InputLabel>
                <Select
                  value={selectedMachine.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as 'free' | 'occupied' | 'broken';
                    handleMachineStatusChange(selectedMachine._id!, newStatus);
                    setSelectedMachine({...selectedMachine, status: newStatus});
                  }}
                  label="Update Status"
                >
                  <MenuItem value="free">Available</MenuItem>
                  <MenuItem value="occupied">In Use</MenuItem>
                  <MenuItem value="broken">Maintenance Required</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    if (window.confirm(`Delete equipment ${selectedMachine.name}?`)) {
                      handleDeleteMachine(selectedMachine._id!);
                      setSelectedMachine(null);
                    }
                  }}
                  sx={{ flex: 1 }}
                >
                  Delete
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setSelectedMachine(null)}
                  sx={{ flex: 1 }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}