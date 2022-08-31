export const Fetch = async (str: string) => {
  const API_URL = 'https://youtube.googleapis.com/youtube/v3';
  const API_KEY = 'AIzaSyBK25-FzELoS7822-DyNfAoi5M4b7D4Ae4';

  const data = await fetch(`${API_URL}${str}&maxResults=50&key=${API_KEY}`)
  const json = await data.json();

  return json;
}