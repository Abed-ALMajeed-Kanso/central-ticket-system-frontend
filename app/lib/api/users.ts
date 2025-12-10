import api from "../connectors/api";
import { CreateUserDto } from "../../types/createUser";

const getAllUsers = async (page: number, size: number, sortBy: string, sortDir: string) =>{
  const res = await api.get(`/users`, {
    params: { page, size, sortBy, sortDir },
  });
  return res.data;
};

const addUser = async (user: CreateUserDto): Promise<CreateUserDto> => {
  try {
    const response = await api.post<CreateUserDto>("/users", user);
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

const deleteUser = async (userId: number | string): Promise<void> => {
  try {
    await api.delete(`/users/${userId}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export { getAllUsers, addUser, deleteUser };
