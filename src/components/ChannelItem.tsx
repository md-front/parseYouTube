import React, { useState } from 'react';

const ChannelItem = ({
  channel,
  setSelectedChannel
  }: any) => {

  const {
    snippet: { channelTitle, thumbnails, description }, 
    id: { channelId }
  } = channel

  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
        {/* <img src={thumbnails.default.url} style={{borderRadius: '50%'}} /> */}
        <div>
          <h2>{channelTitle}</h2>
          <p>{description}</p>
          {channelId &&  
            <button onClick={() => setSelectedChannel(channel)}>Это оно! (save)</button>
          }
          <hr />
        </div>
    </div>
  )
}

export default ChannelItem;