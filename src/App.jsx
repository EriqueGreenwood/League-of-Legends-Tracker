import './App.css'
import React, {useEffect, useState} from 'react'
import axios, { HttpStatusCode } from 'axios';

function App() {
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerData, setPlayerData] = useState({});
  const [champList, setChampList] = useState([]);
  const API_KEY = import.meta.env.VITE_API_KEY;
  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  function getChampName() {
    axios.get('http://ddragon.leagueoflegends.com/cdn/9.6.1/data/en_US/champion.json').then(function(response) {
      var champs = response.data;

      console.log(champs);
    })
  }

  useEffect(()=>{
    if(JSON.stringify(playerData) !== "{}") {
      getPlayerChampions();
    }
  }, [playerData])

  // Looks up the player in the Riot Games API 
  async function searchForPlayer(event) { 
    //Set up API call to lookup player by account name
    let playerDataURL = `${BASE_API_URL}summoner/v4/summoners/by-name/${playerSearch}?api_key=${API_KEY}`;
    //handle API call
    const playerDataResponse = await axios.get(playerDataURL);
    setPlayerData(playerDataResponse.data);

    //checks if player data returned an empty json object
    if(JSON.stringify(playerData) == "{}") {
      changeTextVisibility();
    }

    getChampName();

  }

  // Gets the players top 10 champions
  async function getPlayerChampions() {
    let playerChampDataURL = `${BASE_API_URL}champion-mastery/v4/champion-masteries/by-summoner/${playerData.id}/top?count=10&api_key=${API_KEY}`;

    axios.get(playerChampDataURL).then(function (response) {
      setChampList(response.data);
    });

    console.log(champList);
  }

  // A function to change the text to show if the player doesnt exist in the database (currently only used once)
  function changeTextVisibility() {
    //getElementsByClassName returns an array like object so I need the [0]
    document.getElementsByClassName("hidden")[0].style.display = "block";
  }

  return (
    <div>
      <div>
        <h5>League of Legends Tracker</h5>
        <input type="text" onChange={e => setPlayerSearch(e.target.value)}/>
        <button onClick={e => {searchForPlayer(e)}}>Search</button>
      </div>
      {JSON.stringify(playerData) !="{}" ? 
        <>
          <p>Summoner Name: {playerData.name}</p>
          <img width={100} height={100} src= {`http://ddragon.leagueoflegends.com/cdn/13.13.1/img/profileicon/${playerData.profileIconId}.png`} />
          <p>Summoner Level: {playerData.summonerLevel}</p>
          <div>
            
          </div>
        </> 
        : 
        <><p className='hidden'>No Player by that name found</p></>
      }
    </div>
  )
}

export default App
