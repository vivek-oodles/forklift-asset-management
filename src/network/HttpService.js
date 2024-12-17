import axios from 'axios'
import { getData } from '../utils/localStorageHandler'
// import { baseURL } from './baseUrl'

// Creating axios instance
const http = axios.create({
    // baseURL: baseURL,
    headers: {
        "Content-Type": "application/json"
    }
})

// Optionally add token dynamically if needed
const attachAuthToken = (config) => {
    const token = getData('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}

// Request Interceptor
http.interceptors.request.use(
    (config) => {
        if (config.withAuth) {
            return attachAuthToken(config)
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response Interceptor
http.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error)
    }
)

export default http
