import React, { useState } from 'react';
// import DATA from './data'
import DATA from './data2'
import VIDEOS from './videos'
import { Fetch } from './utils'
  

type imgUrl = {
  url: string,
  width?: number,
  height?: number
};

interface ChannelCard {
  kind: string,
  etag: string,
  id: {
    kind: string,
    channelId: string,
  },
  snippet: {
    publishedAt: string,
    channelId: string,
    title: string,
    description: string,
    thumbnails: {
      default: imgUrl,
      medium: imgUrl,
      high: imgUrl
    },
    channelTitle: string,
    liveBroadcastContent: string,
    publishTime: string,
  },
  contentDetails?: {
    upload: {
      videoId: string
    }
  }
}

type Items = Array<ChannelCard>

// const MockChannelCard: ChannelCard = {
//   kind: '',
//   etag: '',
//   id: {
//     kind: '',
//     channelId: '',
//   },
//   snippet: {
//     publishedAt: '',
//     channelId: '',
//     title: '',
//     description: '',
//     thumbnails: {
//       default: {
//         url: ''
//       },
//       medium: {
//         url: ''
//       },
//       high: {
//         url: ''
//       },
//     },
//     channelTitle: '',
//     liveBroadcastContent: '',
//     publishTime: '',
//   }
// }


const App = () => {
  const [channels, setChannels] = useState<Items | []>([]);
  const [input, setInput] = useState('blackufa');
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);


  const [videos, setVideos] = useState([]);

  const search = async () => {
    const search = await Fetch(`/search?part=snippet&type=channel&q=${input}`);
    setChannels(search.items as Items); 
  }

  let i = 0;

  const getAllVideos = async () => {
    let videos: any = [];

    const getPlaylistItems = async (nextPageToken = '') => {
      const channelId =  selectedChannel.id.channelId
      const playlistId = `UU${channelId.slice(2, channelId.length)}`

      const activitiesJson = await Fetch(`/playlistItems?part=contentDetails&playlistId=${playlistId}${nextPageToken && `&pageToken=${nextPageToken}`}`);
      const videoIds = activitiesJson.items.map((activity: any) => activity.contentDetails.videoId);

      const videoIdsStr = encodeURIComponent(videoIds.join(','))
      const videosWithStat = await Fetch(`/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoIdsStr}`)
      videos.push(...videosWithStat.items);

      if(activitiesJson.nextPageToken && i++ < 1) {
        await getPlaylistItems(activitiesJson.nextPageToken)
      }
    }

    await getPlaylistItems()
    
    const sortedVideos = videos.sort((a: any, b: any) => Number(b.statistics.viewCount) - Number(a.statistics.viewCount))
    
    setVideos(sortedVideos);
  }

  const buildYears = () => {
    const first = new Date().getFullYear() - 1
    const last = new Date(selectedChannel.snippet.publishTime).getFullYear()

    const result = [];

    for(let i = first; i > last; i--) {
      result.push(i)
    }

    return result;
  }

  return (
    <div className="App">

      <div>
        <input type="text" 
              value={input}  
              onChange={(e) => setInput(e.target.value)} />
        <button onClick={search}>search</button>
      </div> 

      {!selectedChannel && channels.map((channel) => 
        <div style={{display: 'flex', alignItems: 'center'}} key={channel.id!.channelId}>
          <img src={channel.snippet.thumbnails.default.url} style={{borderRadius: '50%'}} />
          <div>
            <h2>{channel.snippet.channelTitle}</h2>
            <p>{channel.snippet.description}</p>
            {/* @ts-ignore TODO */}
            {channel.id.channelId &&  
              /* @ts-ignore */
              <button onClick={() => setSelectedChannel(channel)}>Это оно! (save)</button>
            }
            <hr />
          </div>
      </div>
      )}

      {selectedChannel && !videos.length &&
        <div>
          {/* @ts-ignore */}
          <h2>{selectedChannel.snippet.title}</h2>
          {/* @ts-ignore */}
          <p>
            <button>декабрь</button>
            <button>ноябрь</button>
            <button>октябрь</button>
            <button>сентябрь</button>
            <button>август</button>
            <button>июль</button>
            <button>июнь</button>
            <button>май</button>
            <button>апрель</button>
            <button>март</button>
            <button>февраль</button>
            <button>январь</button>
            {buildYears().map(year => 
              <button>{year}</button>
            )}
          </p>
          <button onClick={getAllVideos}>найти</button>
        </div>
        // *по дефолту последний месяц
      }

      {videos.map(({id, snippet, statistics}: any) => 
        <div key={id}>
          <img src={snippet.thumbnails.medium.url} alt="" />
          <h2>{snippet.title}  <a href={`https://www.youtube.com/watch?v=${id}`}>link</a></h2>
          <span>{new Date(snippet.publishedAt).toDateString()}</span>
          <h3>{statistics.viewCount} просмотров</h3>
          <hr />
        </div>
      )}
    </div>
  );
}

export default App;
