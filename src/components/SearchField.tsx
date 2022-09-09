import React, { useState } from 'react';

const SearchField = ({search}: any) => {
  const [inputValue, setInput] = useState('blackufa');

  return (
    <div>
      <h4>Поисковый запрос с названием канала:</h4>
      <input type="text" 
            value={inputValue}  
            onChange={(e) => setInput(e.target.value)} />
      <button onClick={() => search(inputValue)}>search</button>
    </div>  
  )
}

export default SearchField;