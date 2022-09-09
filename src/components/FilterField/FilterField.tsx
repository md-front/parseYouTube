import React, { useState } from 'react';


const FilterField = ({
  title = '', defaultValue = '', addInclude
}: any) => {
  const [value, setValue] = useState(defaultValue)

  const add = () => {
    setValue(defaultValue)
    addInclude(value)
  }

  return (
    <div>
      <h4>В запросе должны быть (или):</h4>
      <input type="text" value={value} onChange={e => setValue(e.target.value)} />
      <button onClick={add}>+</button>
    </div>
  )
}

export default FilterField;