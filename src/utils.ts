import { SearchJson } from './App';

type Path = '/search' | '/videos'

interface Options {
  part: string,
  channelId: string,
  order: string,
  publishedAfter: string,
  publishedBefore: string,
  type: 'video' | 'channel',
  pageToken: string,
  id: Array<string>,
  q: string
}

type Option = keyof Options;

type FetchType = (path: Path, options: Partial<Options>) => SearchJson | any;

type Load = (keyIndex: number) => void

let keyIndex = 0;

export const Fetch: FetchType = async (path, options) => {
  const API_URL = 'https://youtube.googleapis.com/youtube/v3';
  
  const KEYS = [
    'AIzaSyBK25-FzELoS7822-DyNfAoi5M4b7D4Ae4', 
    'AIzaSyBn1KEru7ezUsT6ZQgss0IgEDVqD3xkaO4'
  ];

  let payload: Array<string> = [];

  for(let option in options) {
    if(options[option as Option]) {
      payload.push(`${option}=${encodeURIComponent(options[option as Option] as string)}`)
    }
  }

  const load: Load = async (currentkeyIndex) => {
    try {
      const data = await fetch(`${API_URL}${path}?${payload.join('&')}&maxResults=50&key=${KEYS[currentkeyIndex]}`)
      const json = await data.json();

      if(json?.error?.message?.match('quota')) {

        if(KEYS[keyIndex++]) {
          return load(keyIndex)
        } else {
          throw new Error('Лимит квоты со всех ключей')
        }
      } else {
        return json;
      
      }
    } catch (e) {
      console.log(e)
    }
  }

  return load(keyIndex)
}

type DeclOfNum = (number: number, words: Array<string>) => string;

/* Склонение от числового значения, формат: (1, ['минута', 'минуты', 'минут'])  */
export const declOfNum: DeclOfNum = (number, words) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
};