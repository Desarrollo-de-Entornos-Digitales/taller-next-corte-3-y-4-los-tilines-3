import axios from 'axios';

// Log para depuración: mostrar el valor de la variable de entorno en el cliente
if (typeof window !== 'undefined') {
    // Solo en el cliente
    // eslint-disable-next-line no-console
    console.log('NEXT_PUBLIC_API:', process.env.NEXT_PUBLIC_API);
}

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosClient;
