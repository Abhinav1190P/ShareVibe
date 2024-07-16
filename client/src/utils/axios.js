import axios from "axios";

const baseURL = 'http://localhost:4000'

export default axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export const axiosPrivate = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
