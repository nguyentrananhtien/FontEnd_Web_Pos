import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://192.168.1.108:9090',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default instance;