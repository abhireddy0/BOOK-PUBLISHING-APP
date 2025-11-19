
import axios from "axios";
import { serverUrl } from "../config/server";

export const signup = async (payload) => {
  const res = await axios.post(`${serverUrl}/auth/signup`, payload);
  return res.data; // { message, user }
};

export const login = async (payload) => {
  const res = await axios.post(`${serverUrl}/auth/login`, payload);
  return res.data; // { message, token, user }
};
