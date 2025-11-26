import api from './api';

export const fetchHalls = async () => {
  const response = await api.get('/halls');
  return response.data;
};

export const fetchHallById = async (id) => {
  const response = await api.get(`/halls/${id}`);
  return response.data;
};

export const createHall = async (hallData) => {
  const response = await api.post('/halls', hallData);
  return response.data;
};

export const updateHall = async (id, hallData) => {
  const response = await api.put(`/halls/${id}`, hallData);
  return response.data;
};

export const deleteHall = async (id) => {
  const response = await api.delete(`/halls/${id}`);
  return response.data;
};
