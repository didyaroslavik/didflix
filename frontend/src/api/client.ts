import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true, // sends cookies automatically with every request
});

export default client;