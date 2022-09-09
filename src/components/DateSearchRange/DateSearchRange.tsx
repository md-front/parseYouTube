import React, { useEffect, useMemo, useState } from 'react';
import './DateSearchRange.css'

enum MONTHS {
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
}

type DateItem = {
  date: Date,
  dateMax: Date,
  displayName: string | number,
  isActive: boolean,
};
type Extremum = Date | null;
type Dates = Array<DateItem>

const DateSearchRange = ({
  selectedChannel, getVideos
}: any) => {
  const [datesList, setDatesList] = useState<Dates>([] as Dates); 
  const [minDate, setMinDate] = useState<Extremum>(null);
  const [maxDate, setMaxDate] = useState<Extremum>(null);

  const datesListWithStatus = useMemo(() => datesList.map((dateItem: DateItem) => {
    dateItem.isActive = minDate !== null && minDate <= dateItem.date && 
                        maxDate !== null && dateItem.date <= maxDate

    return dateItem
  }), [datesList, minDate, maxDate])


  useEffect(() => {
    const initDatesList: Dates = [];

    const currentYear = new Date().getFullYear()
    const firstMonth = new Date().getMonth()

    for(let i = firstMonth; i >= 0; i--) {
      initDatesList.push({
        date: new Date(currentYear, i, 1),
        dateMax: new Date(currentYear, i + 1, 0),
        displayName: MONTHS[i],
        isActive: false
      })
    }

    const firstYear = currentYear - 1
    const lastYear = new Date(selectedChannel.snippet.publishTime).getFullYear()

    for(let i = firstYear; i > lastYear; i--) {
      initDatesList.push({
        date: new Date(i, 0, 1),
        dateMax: new Date(i + 1, 0, 0),
        displayName: i,
        isActive: false
      })
    }

    setDatesList(initDatesList);
  },[])


  const toggle = (updatedDateItem: DateItem) => {
    updatedDateItem.isActive = !updatedDateItem.isActive;

    let newMax = maxDate;
    let newMin = minDate;
    let minLimit = null;

    const prevOfUpdated = datesList[datesList?.indexOf(updatedDateItem)+1]?.dateMax;
    const nextOfUpdated = datesList[datesList?.indexOf(updatedDateItem)-1]?.date;

    if(!updatedDateItem.isActive && 
      (newMin !== null && newMin < updatedDateItem.date 
      && newMax !== null && updatedDateItem.dateMax < newMax)) {
      newMin = nextOfUpdated;
      minLimit = nextOfUpdated;
    }

    for(let dateItem of datesList) {

      if(dateItem.isActive) {
        if((newMin === null || dateItem.date < newMin) && (minLimit === null || dateItem.date >= minLimit)) {
          newMin = dateItem.date
        }
        if(newMax === null || dateItem.date > newMax) {
          newMax = dateItem.dateMax
        }
      } else if(updatedDateItem === dateItem) {
        if(updatedDateItem.date === newMin && updatedDateItem.dateMax === newMax) {
          newMin = null;
          newMax = null;
          break;
        } else if(updatedDateItem.date === newMin) {
          newMin = nextOfUpdated
        } else if(updatedDateItem.dateMax === newMax) {
          newMax = prevOfUpdated
        }
      }
    }
    setMinDate(newMin);
    setMaxDate(newMax);
  }

  return (
    <div>
      {datesListWithStatus.map((dateItem: DateItem) => 
        <button key={dateItem.displayName} 
        className={dateItem.isActive ? 'active' : ''}
        onClick={() => toggle(dateItem)}>{dateItem.displayName}</button>
      )} 
      <br />  
      <br />  
      <button onClick={() => getVideos({ minDate, maxDate })}>найти</button>
    </div>
  )
}

export default DateSearchRange;