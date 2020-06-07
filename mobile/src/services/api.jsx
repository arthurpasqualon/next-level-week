import axios from 'axios'

const api = axios.create({
	baseURL: "http://192.168.0.49:8877/"
  })

export default api;