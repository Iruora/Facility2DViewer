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
}

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await fetch('http://localhost:3001/api/rooms');
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  return response.json();
};

