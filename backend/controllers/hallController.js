// Mock Data
let halls = [
  {
    id: '1',
    name: 'Hall A',
    type: '2D',
    capacity: 100,
    location: 'Floor 1',
  },
  {
    id: '2',
    name: 'Hall B',
    type: '3D',
    capacity: 150,
    location: 'Floor 2',
  },
  {
    id: '3',
    name: 'VIP Lounge',
    type: 'VIP',
    capacity: 50,
    location: 'Floor 3',
  }
];

export const getHalls = (req, res) => {
  res.status(200).json(halls);
};

export const getHallById = (req, res) => {
  const hall = halls.find((h) => h.id === req.params.id);
  if (hall) {
    res.status(200).json(hall);
  } else {
    res.status(404).json({ message: 'Hall not found' });
  }
};

export const createHall = (req, res) => {
  const { name, type, capacity, location } = req.body;
  const newHall = {
    id: Date.now().toString(),
    name,
    type,
    capacity,
    location,
  };
  halls.push(newHall);
  res.status(201).json(newHall);
};

export const updateHall = (req, res) => {
  const { id } = req.params;
  const { name, type, capacity, location } = req.body;
  
  const index = halls.findIndex((h) => h.id === id);
  if (index !== -1) {
    halls[index] = { ...halls[index], name, type, capacity, location };
    res.status(200).json(halls[index]);
  } else {
    res.status(404).json({ message: 'Hall not found' });
  }
};

export const deleteHall = (req, res) => {
  const { id } = req.params;
  const index = halls.findIndex((h) => h.id === id);
  if (index !== -1) {
    halls = halls.filter((h) => h.id !== id);
    res.status(200).json({ message: 'Hall deleted successfully' });
  } else {
    res.status(404).json({ message: 'Hall not found' });
  }
};
