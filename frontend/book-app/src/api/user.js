// src/api/user.js
import axios from "axios";
import { serverUrl } from "../config/server";

export const getMyProfileApi = async (token) => {
  const res = await axios.get(`${serverUrl}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateMyProfileApi = async (payload, token) => {
  const res = await axios.patch(`${serverUrl}/users/me`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // { message, user }
};
 