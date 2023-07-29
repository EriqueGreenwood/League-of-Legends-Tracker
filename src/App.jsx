import './App.css'
import React, {useEffect, useState} from 'react'
import axios from 'axios';

 const App = () => {
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerData, setPlayerData] = useState({});
  const [champList, setChampList] = useState([]);
  const [championNames, setChampionNames] = useState([]);
  const [challenges, setChallenges] = useState({});
  const [champImageName, setChampImageName] = useState([]);
  const API_KEY = import.meta.env.VITE_API_KEY;
  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  // Searches for player in Riot Games api
  
  const searchForPlayer = (event) => { 
    setPlayerData([]);
    setChampList({});
    setChampionNames([]);
    setChallenges({});
    setChampImageName([]);
    // Get server status for NA
    let serverStatus = `${BASE_API_URL}status/v4/platform-data?api_key=${API_KEY}`;
    axios.get(serverStatus)
    .then((response) => {
      console.log("server status");
      setServerStatus(response.data);
    });
    // Set up API call to lookup player by account name
    let playerDataURL = `${BASE_API_URL}summoner/v4/summoners/by-name/${playerSearch}?api_key=${API_KEY}`;
    // API calls to get all player data needed
    axios.get(playerDataURL)
    .then((response) => {
      console.log("in first api call");
      setPlayerData(response.data);
      return response.data;
    })
    .then(playerData => (axios.get(`${BASE_API_URL}challenges/v1/player-data/${playerData.puuid}?api_key=${API_KEY}`))
    .then(response => {
      setChallenges(response.data);
      return playerData;
    })
    .then(playerData => (axios.get(`${BASE_API_URL}champion-mastery/v4/champion-masteries/by-summoner/${playerData.id}/top?count=10&api_key=${API_KEY}`))
    .then(response => {
      setChampList(response.data);
      return response.data;
    })
    .then((champList) => (axios.get(`https://ddragon.leagueoflegends.com/cdn/13.13.1/data/en_US/champion.json`))
    .then(response => {
      const list = response.data.data;
      console.log(list);

      for(let i = 0; i < champList.length; i++) {
        const champNames = [];
        for(let key in list) {
          if(list[key].key == champList[i].championId) {
            // This is how you work around React state async nature to add things in a loop, a functional update approach by providing a callback to the state updater function
            setChampionNames(championNames => [...championNames, list[key].name]);
            setChampImageName(champImageName => [...champImageName, list[key].image.full]);
          }
        }
      }
    }), [])));

  }

  useEffect(() => {
    createChampDisplay();
  }, [champImageName]);

  useEffect(() => {

  }), []


  function createChampDisplay() {

    for(let i = 0; i < champList.length; i++) {
      let champBoxDisplay = document.getElementById("flex-container");

      let champBox = document.createElement("div");
      champBox.setAttribute('class', 'champ-box');

      let champImage = document.createElement("img");
      champImage.setAttribute('src', `http://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${champImageName[i]}`);

      let champName = document.createElement("div");
      champName.append(championNames[i]);

      let champLevel = document.createElement("div");
      champLevel.append("Champion Level: ", champList[i].championLevel);

      let champPoints = document.createElement("div");
      champPoints.append("Champion Points: ", champList[i].championPoints);

      let champChest = document.createElement("div");
      champChest.append("Champion Chest Granted: ", champList[i].chestGranted);

      champBox.append(champImage, champName, champLevel, champPoints, champChest);
      champBoxDisplay.append(champBox);
    }
  }

  return (
    <div className='main-container'>
      <div className='search-box'>
        <h2>League of Legends Tracker</h2>
        <input type="text" onChange={e => setPlayerSearch(e.target.value)}/>
        <button type="submit" onClick={e => {searchForPlayer(e)}}>{loading ? <>Loading...</> : <>Search</>}</button>
      </div>
      <div id='summoner-display'>
        {JSON.stringify(playerData) !="{}" ? 
        <>
          <div className='summoner-info'>
            <p>Summoner Name: {playerData.name}</p>
            <img width={100} height={100} src= {`https://ddragon.leagueoflegends.com/cdn/13.13.1/img/profileicon/${playerData.profileIconId}.png`} />
            <p>Summoner Level: {playerData.summonerLevel}</p>
          </div> 
          <h2>Summoners Top 10 Champions</h2>
          <div className='champ-stuff' id='flex-container'>
          </div>
        </>
          
          : 
          <><p className='hidden'>No Player by that name found</p></>
        }
      </div>
    </div>
  )
}

export default App
