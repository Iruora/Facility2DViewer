export interface Room {
  id: string;
  name: string;
  path: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  position?: {
    x: number;
    y: number;
  };
}

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await fetch('http://localhost:3001/api/rooms');
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  return response.json();
};

export const updateRoomPosition = async (roomId: string, x: number, y: number): Promise<Room> => {
  const response = await fetch(`http://localhost:3001/api/rooms/${roomId}/position`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x, y })
  });
  if (!response.ok) {
    throw new Error('Failed to update room position');
  }
  return response.json();
};

