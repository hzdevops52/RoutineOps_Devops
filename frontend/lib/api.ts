import axios from "./axiosInstance";

// Health
export const getHealth = async () => (await axios.get("/health")).data;

// Teachers
export const getTeachers = async () => (await axios.get("/teachers")).data;
export const createTeacher = async (payload: any) => (await axios.post("/teachers", payload)).data;
export const updateTeacher = async (id: string, payload: any) => (await axios.put(`/teachers/${id}`, payload)).data;
export const deleteTeacher = async (id: string) => (await axios.delete(`/teachers/${id}`)).data;

// Subjects
export const getSubjects = async (params?: any) => (await axios.get("/subjects", { params })).data;
export const createSubject = async (payload: any) => (await axios.post("/subjects", payload)).data;

// Sections
export const getSections = async () => (await axios.get("/sections")).data;
export const createSection = async (payload: any) => (await axios.post("/sections", payload)).data;

// Schedule
export const generateSchedule = async (payload: any) => (await axios.post("/routines", payload)).data;
export const getSchedule = async (params?: any) => (await axios.get("/routines", { params })).data;
