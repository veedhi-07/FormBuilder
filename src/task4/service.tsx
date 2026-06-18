import api from "./api";

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data.data.users;
};

export const getRoles = async () => {
  const res = await api.get("/roles");
  return res.data.data.roles;
};

export const getDashboard = async () => {
  const res = await api.get("/dashboard");
  return res.data.data.recentUsers;
};
