export interface Machine {
  _id?: string;
  name: string;
  roomId: string;
  x: number;
  y: number;
  status: 'free' | 'occupied' | 'broken';
}

export const fetchMachines = async (): Promise<Machine[]> => {
  const response = await fetch('http://localhost:3001/api/machines');
  if (!response.ok) {
    throw new Error('Failed to fetch machines');
  }
  return response.json();
};

export const updateMachine = async (id: string, updates: Partial<Machine>): Promise<Machine> => {
  const response = await fetch(`http://localhost:3001/api/machines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
    throw new Error('Failed to update machine');
  }
  return response.json();
};

export const createMachine = async (machine: Omit<Machine, '_id'>): Promise<Machine> => {
  const response = await fetch('http://localhost:3001/api/machines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(machine)
  });
  if (!response.ok) {
    throw new Error('Failed to create machine');
  }
  return response.json();
};

export const deleteMachine = async (id: string): Promise<void> => {
  const response = await fetch(`http://localhost:3001/api/machines/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete machine');
  }
};