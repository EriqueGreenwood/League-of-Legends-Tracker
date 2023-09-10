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
  const [matchIds, setMatchIds] = useState([]);
  const [matchStats, setMatchStats] = useState([]);
  const API_KEY = import.meta.env.VITE_API_KEY;
  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  const handleSubmit = (event) => {
    searchForPlayer();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  // Searches for player in Riot Games api
  
  const searchForPlayer = (event) => { 
    event.preventDefault();
    setPlayerData([]);
    setChampList({});
    setChampionNames([]);
    setChallenges({});
    setChampImageName([]);
    // clear made divs for champ box
    const divsToRemove = document.querySelectorAll('#champ-box-id');
    divsToRemove.forEach((div) => {
      div.remove();
    })
    // Set up API call to lookup player by account name
    let playerDataURL = `${BASE_API_URL}summoner/v4/summoners/by-name/${playerSearch}?api_key=${API_KEY}`;
    // API calls to get all player data needed
    axios.get(playerDataURL).then((response) => {
      setPlayerData(response.data);
      return response.data;
    }).catch((error) => {
      if (error.response) {
        // The request was made, and the server responded with a status code that falls out of the range of 2xx
        console.log('Error Status:', error.response.status);
        console.log('Error Data:', error.response.data);
      } else if (error.request) {
        // The request was made, but no response was received, `error.request` is an instance of XMLHttpRequest in the browser
        const displayOrNot = document.querySelector('.summoner-info').style.display = 'none';
        alert("No player by that name found"); 
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error:', error.message);
      }
      return;
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
      return playerData;
    })
    .then(playerData => (axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${playerData.puuid}/ids?start=0&count=10&api_key=${API_KEY}`))
    .then(response => {
      setMatchIds(response.data);
      return response.data;
    })
    .then(matchIds => {
      for(let matches in matchIds) {
        const response = axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchIds[matches]}?api_key=${API_KEY}`).then(response => {
          setMatchStats(matchStats => [...matchStats, response.data]);
        })
      }
    }), []))));

    // Get server status for NA
    let serverStatus = `${BASE_API_URL}status/v4/platform-data?api_key=${API_KEY}`;
    axios.get(serverStatus).then((response) => {
      setServerStatus(response.data);
    });

    const showSummoner = document.querySelector('.summoner-info').style.display = 'block';
  }
  
  useEffect(() => {
    createChampDisplay();
  }, [champImageName]);
  
  function createChampDisplay() {
    
    for(let i = 0; i < champList.length; i++) {
      let champBoxDisplay = document.getElementById("flex-container");
      
      let champBox = document.createElement("div");
      champBox.setAttribute('class', 'champ-box');
      champBox.setAttribute('id', 'champ-box-id');
      
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

  // useEffect(() => {
  //   showPastMatches();
  // }, [matchStats]);

  // function showPastMatches() {

  //   for(let i = 0; i < matchStats.length; i++) {

  //     let pastMatchDisplay = document.getElementById("past-matches-container");
      
  //     let matchBox = document.createElement("div");
  //     matchBox.setAttribute('class', 'champ-box');
  //     matchBox.setAttribute('id', 'champ-box-id');

  //     let matchDuration = document.createElement("div");
  //     matchDuration.append(matchStats[i].info.gameDuration);

  //     matchBox.append(matchDuration);
  //     pastMatchDisplay.append(matchBox);
      
  //   }
  // }


  return (
    <div className='main-container'>
      <h2>League of Legends Tracker</h2>
      <div>
        <form className='search-box'>
          <div className='region-field'>
            <label htmlFor="input-field" className='label'>Region</label>
            <select type="text" id="na" placeholder="North America" onChange={e => setPlayerSearch(e.target.value)} onKeyDown={e => handleKeyPress(e)}>
              <option value="na">North America</option>
            </select>
          </div>
          <div className='search-field'>
            <label htmlFor="input-field" className='label'>Search</label>
            <input type="text" id="input-field" placeholder="Name" onChange={e => setPlayerSearch(e.target.value)} onKeyDown={e => handleKeyPress(e)}/>
          </div>
          <button type="submit"  onClick={e => {searchForPlayer(e)}}>{loading ? <>Loading...</> : <>Search</>}</button>
        </form>
      </div>
      <div id='summoner-display'>
        <>
          <div className='summoner-info'>
            <p>Summoner Name: {playerData.name}</p>
            <img width={100} height={100} src= {`https://ddragon.leagueoflegends.com/cdn/13.13.1/img/profileicon/${playerData.profileIconId}.png`} className='champ-img'/>
            <p>Summoner Level: {playerData.summonerLevel}</p>
            <h2>Summoners Top 10 Champions</h2>
            <div className='champ-stuff' >
              <table id='flex-container'>
                <tbody>
                  <tr>
                  </tr>
                </tbody>
              </table>

            </div>
            <div className='past-matches' id='past-matches-container'>

            </div>
          </div> 
        </>   
      </div>
    </div>
  )
}

export default App
