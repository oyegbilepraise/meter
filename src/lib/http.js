import axios from 'axios';

const http = axios.create({
  baseURL: 'https://sellbackend.creditclan.com/merchantclan/public/index.php/api'
});

export default http;
