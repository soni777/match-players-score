const express = require("express");
const app = express();
app.use(express.json());

module.exports = app;

const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("srever runs on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db ERROR: ${e.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

//get API 1 Returns a list of all the players in the player table
app.get("/players/", async (request, response) => {
  try {
    const getPlayersQuery = `SELECT player_id AS playerId,player_name AS playerName FROM player_details`;
    const players = await db.all(getPlayersQuery);
    response.send(players);
  } catch (e) {
    console.log(`get ERROR: ${e.message}`);
  }
});

// get API 2 Returns a specific player based on the player ID
app.get("/players/:playerId", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayersQuery = `SELECT player_id AS playerId,player_name AS playerName 
    FROM player_details
    WHERE player_id =${playerId}`;
    const players = await db.get(getPlayersQuery);
    response.send(players);
  } catch (e) {
    console.log(`get ERROR: ${e.message}`);
  }
});

//update API 3 Updates the details of a specific player based on the player ID
app.put("/players/:playerId", async (request, response) => {
  try {
    const { playerId } = request.params;
    const details = request.body;
    const { playerName } = details;
    const updatePlayersQuery = `UPDATE player_details 
    SET player_name ='${playerName}' 
    WHERE player_id =${playerId}`;
    await db.run(updatePlayersQuery);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(`get ERROR: ${e.message}`);
  }
});

// get API 4  Returns the match details of a specific match
app.get("/matches/:matchId/", async (request, response) => {
  try {
    const { matchId } = request.params;
    const getMatchQuery = `SELECT match_id AS matchId,match,year 
        FROM match_details 
        WHERE match_id=${matchId}`;
    const match = await db.get(getMatchQuery);
    response.send(match);
  } catch (e) {
    console.log(`Get ERROR: ${e.message}`);
  }
});

// get API 5 Returns a list of all the matches of a player. match using player id
app.get("/players/:playerId/matches/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getMatchesQuery = `SELECT match_id AS matchId, match,year 
        FROM match_details NATURAL JOIN player_match_score 
        WHERE player_id = ${playerId}`;
    const matchesOfPlayer = await db.all(getMatchesQuery);
    response.send(matchesOfPlayer);
  } catch (e) {
    console.log(`get error API 5 : ${e.message}`);
  }
});

// get API 6 Returns a list of players of a specific match
app.get("/matches/:matchId/players/", async (request, response) => {
  try {
    const { matchId } = request.params;
    const matchPlayersQuery = `SELECT player_id AS playerId , player_name AS playerName
        FROM player_details NATURAL JOIN player_match_score 
        WHERE match_id = ${matchId}`;
    const players = await db.all(matchPlayersQuery);
    response.send(players);
  } catch (e) {
    console.log(`GET API 6 ERROR: ${e.message}`);
  }
});

// get API 7 Returns the statistics of the total score, fours, sixes of a specific player based on the player ID
app.get("/players/:playerId/playerScores/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const statisticQuery = `SELECT player_id AS playerId,player_name AS playerName,SUM(score) AS totalScore,SUM(fours) AS totalFours,SUM(sixes) AS totalSixes
        FROM player_details NATURAL JOIN player_match_score
        WHERE player_id = ${playerId}`;
    const playerScore = await db.get(statisticQuery);
    response.send(playerScore);
  } catch (e) {
    console.log(`GET API 7 ERROR: ${e.message}`);
  }
});
