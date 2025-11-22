import axios from "axios";
import { serverUrl } from "../config/server";

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const createBookApi = async (payload, token) => {
  const res = await axios.post(
    `${serverUrl}/books`,
    payload,
    authHeaders(token)
  );
  return res.data; // { message, book }
};

export const getBookByIdApi = async (bookId, token) => {
  const res = await axios.get(
    `${serverUrl}/books/${bookId}`,
    authHeaders(token)
  );
  return res.data;
};

export const updateBookApi = async (bookId, payload, token) => {
  const res = await axios.patch(
    `${serverUrl}/books/${bookId}`,
    payload,
    authHeaders(token)
  );
  return res.data;
};

export const getReadableBookApi = async (bookId, token) => {
  const res = await axios.get(`${serverUrl}/books/${bookId}/read`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const deleteBookApi = async (bookId, token) => {
  const res = await axios.delete(
    `${serverUrl}/books/${bookId}`,
    authHeaders(token)
  );
  return res.data;
};

export const uploadBookCoverApi = async (bookId, file, token) => {
  const fd = new FormData();
  fd.append("cover", file);

  const res = await axios.patch(`${serverUrl}/books/${bookId}/cover`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const uploadBookFileApi = async (bookId, file, token) => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await axios.patch(`${serverUrl}/books/${bookId}/file`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const setPublishApi = async (bookId, published, token) => {
  const res = await axios.patch(
    `${serverUrl}/books/${bookId}/publish`,
    { published },
    authHeaders(token)
  );
  return res.data;
};
