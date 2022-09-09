import { useState } from 'react';
import { declOfNum, Fetch } from './utils'
import SearchField from './components/SearchField';
import ChannelItem from './components/ChannelItem';
import DateSearchRange from './components/DateSearchRange';
import FilterField from './components/FilterField';
import './all.css'

interface SearchItem {
  kind: string,
  etag: string,
  id: {
    kind: string,
    videoId: string,
    channelId: string,
    playlistId: string
  },
  snippet: {
    publishedAt: Date,
    channelId: string,
    title: string,
    description: string,
    thumbnails: {
      [key: string]: {
        url: string,
        width: number,
        height: number
      }
    },
    channelTitle: string,
    liveBroadcastContent: string
  }
}

// interface VideoItem {
//   kind: string,
//   etag: string,
//   id: string,
//   statistics: {
//     viewCount: string,
//     likeCount: string,
//     dislikeCount: string,
//     favoriteCount: string,
//     commentCount: string
//   },
//   fileDetails: {
//     fileName: string,
//     fileSize: unsigned long,
//     fileType: string,
//     container: string,
//     videoStreams: [
//       {
//         widthPixels: unsigned integer,
//         heightPixels: unsigned integer,
//         frameRateFps: double,
//         aspectRatio: double,
//         codec: string,
//         bitrateBps: unsigned long,
//         rotation: string,
//         vendor: string
//       }
//     ],
//     audioStreams: [
//       {
//         channelCount: unsigned integer,
//         codec: string,
//         bitrateBps: unsigned long,
//         vendor: string
//       }
//     ],
//     durationMs: unsigned long,
//     bitrateBps: unsigned long,
//     creationTime: string
//   },
//   suggestions: {
//     processingErrors: [
//       string
//     ],
//     processingWarnings: [
//       string
//     ],
//     processingHints: [
//       string
//     ],
//     tagSuggestions: [
//       {
//         tag: string,
//         categoryRestricts: [
//           string
//         ]
//       }
//     ],
//     editorSuggestions: [
//       string
//     ]
//   },
// }

type TotalResults = number;
type NextPageToken = string | undefined;

export interface SearchJson {
  kind: string,
  etag: string,
  nextPageToken: NextPageToken,
  prevPageToken?: string,
  regionCode: string,
  pageInfo: {
    totalResults: TotalResults,
    resultsPerPage: number
  },
  items: Array<SearchItem>
}

type Extremum = Date | null;
interface GetVideosParams {
  minDate: Extremum, 
  maxDate: Extremum
}
type GetVideos = (params: GetVideosParams) => void; 

const App = () => {
  const [channels, setChannels] = useState<Array<SearchItem>>([]);
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [videos, setVideos] = useState<Array<SearchItem>>([]);
  const [nextPageToken, setNextPageToken] = useState<NextPageToken>(undefined);
  const [alert, setAlert] = useState<string>('');

  const [filterInclude, setFilterInclude] = useState<Array<string>>([]);

  const search = async (inputValue: string) => {
    setSelectedChannel(null)
    setVideos([])

    const search: SearchJson = await Fetch(`/search`,
    {
      part: `snippet`,
      order: `videoCount`,
      type: `channel`,
      q: inputValue,
    });
    setChannels(search.items); 
  }

  const getVideos: GetVideos = async ({ minDate, maxDate }) => {
    setLoading(true)
    setAlert('')

    const newVideos = videos; 

    const videosJson: SearchJson = await Fetch(`/search`,
    {
      part: `snippet, id`,
      channelId: selectedChannel.id.channelId,
      order: 'viewCount',
      publishedAfter: minDate?.toISOString(),
      publishedBefore: maxDate?.toISOString(),
      type: 'video',
      pageToken: nextPageToken,
      q: filterInclude.join('|')
    });

    if(!videosJson.items.length) {
      setAlert('Видео за данный период нет')
      setLoading(false)
      return;
    }

    const videosStatistics = await Fetch(`/videos`, {
      part: 'id, snippet, contentDetails, statistics',
      id: videosJson.items.map(video => video.id.videoId)
    })

    newVideos.push(...videosStatistics.items);
    
    setVideos(newVideos);
    setNextPageToken(videosJson.nextPageToken)
    setLoading(false)
  }

  const addInclude = (value: string) => {
    setFilterInclude([
      ...filterInclude,
      value
    ])
  }

  const formatDuration = (durationStr: any) => {
    let duration = durationStr.match(/\d+/ig);

    return duration.reverse()
                   .map((item: any, i: any, arr: any) => {
                     if(i === 3) {
                       return null;
                     }

                     if(i === 2 && arr[3]) {
                       return String(+item + 24 * +arr[3])
                     }

                     if(i !== arr.length - 1) {
                       return item.padStart(2, '0')
                     }

                     return item
                   })
                   .filter(Boolean)
                   .reverse()
                   .join(':')
  }
  
  const formatViews = (views: any) => {
    let roundOn = 0;
    let count = '';

    if(+views > 999999) {
      count = ' млн'
      roundOn = 6;
    } else if(+views > 999) { 
      count = ' тыс.'
      roundOn = 3;
    }
    
    let round = views.substring(0, views.length - roundOn);
    const additionalSymbol = views.substring(views.length - roundOn, views.length - roundOn + 1);

    if(roundOn && round < 10 && additionalSymbol > 0) {
      round = `${round},${additionalSymbol}`
    }

    return `${round}${count} просмотров`
  }

  const formatDate = (date: string) => {
    const HOUR = 1000*60*60;
    const DAY = HOUR*24;
    const diff = new Date().getTime()-new Date(date).getTime();
    
    const years = Math.floor(diff/(DAY*365));

    if(years > 0) {
      const lang = declOfNum(years, ['год','года','лет'])
      return `${years} ${lang} назад`
    }

    const months = Math.floor(diff/(DAY*30));

    if(months > 0) {
      const lang = declOfNum(months, ['месяц','месяца','месяцев'])
      return `${months} ${lang} назад`
    }

    const days = Math.floor(diff/(DAY));

    if(days > 0) {
      const lang = declOfNum(days, ['день','дня','дней'])
      return `${days} ${lang} назад`
    }

    const hours = Math.floor(diff/(HOUR));

    if(hours > 0) {
      const lang = declOfNum(hours, ['час','часа','часов'])
      return `${hours} ${lang} назад`
    }

    return `меньше часа назад`
  }

  return (
    <div className="App">
      <SearchField search={search} />

      {!selectedChannel && channels.map((channel) => 
        <ChannelItem channel={channel} 
        setSelectedChannel={setSelectedChannel}
        key={channel.id.channelId}/>
      )} 

      {selectedChannel && !videos.length &&
        <div>
          <div>
            <FilterField title=''
                        addInclude={(value:string) => addInclude(value)} /> 

            <div>
              {filterInclude.map(filterItem => 
                <button key={filterItem}>{filterItem}</button>  
              )}
            </div>
          </div>
            <hr />
          <DateSearchRange selectedChannel={selectedChannel} 
          getVideos={getVideos} />
        </div>
      }
      {loading && <h2>Загрузка ...</h2>}

      {alert && <h2>{alert}</h2>}
      
      <div className='videoItems'>
        {videos.map(({id, snippet, statistics, contentDetails}: any) => 
          <div key={id} className='videoItem'>
            <a href={`https://www.youtube.com/watch?v=${id}`} 
               className='videoItem__top'>
              <img src={snippet.thumbnails.medium.url} alt="" />
              <h3 className='videoItem_duration'>{formatDuration(contentDetails.duration)}</h3>
            </a>
            <a href={`https://www.youtube.com/watch?v=${id}`} className="videoItem__title">{snippet.title}</a>
            <div className='videoItem__info'>{formatViews(statistics?.viewCount)}</div>
            <div className='videoItem__info'>{formatDate(snippet.publishedAt)}</div>
          </div>
        )}
      </div>

      {nextPageToken && 
        <button onClick={() => getVideos({} as GetVideosParams)}>MORE</button>
      }
    </div>
  );
}

export default App;
