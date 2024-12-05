import axios from 'axios';

const url = 'http://192.168.0.109:5000'; 
const apiUrl = url + '/api'; 

export const checkConnection = async () => {
    try {
        await axios.get(`${url}`);
        return true;
    } catch (error) {
        console.error('Error connecting to server:', error);
        return false;
    }
};

export const fetchRooms = async () => {
    try {
        const response = await axios.get(`${apiUrl}/rooms`);
        const rooms = [];
        response.data.map(obj => rooms.push(obj.name));
        return rooms;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const addRoom = async (data) => {
    try {
        const response = await axios.post(`${apiUrl}/rooms`, data);
        alert("New room Added");
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const response = await axios.get(`${apiUrl}/users`);
        const users = response.data.map(obj => ({
            uid: obj.uid, 
            email: obj.email, 
            name: obj.name, 
            active: obj.active, 
            color: obj.color
        }));
        return users;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const addUser = async (data) => {
    try {
        const response = await axios.post(`${apiUrl}/users`, data);
        alert("New user Added");
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

export const fetchMessages = async () => {
    try {
        const response = await axios.get(`${apiUrl}/messages`);
        const messages = response.data.map(obj => ({
            mid: obj.mid,
            content: obj.content, 
            sender: obj.sender, 
            room: obj.room
        }));
        return messages;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const addMessage = async (data) => {
    try {
        const response = await axios.post(`${apiUrl}/messages`, data);
        alert("New message Added");
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};