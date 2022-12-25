import { Button, Card, CardActions, CardContent, Grid, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GamesIcon from "@mui/icons-material/Games";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import styles from "./home.module.css";

const loadingEffect = {
  data: <AccountCircleIcon className={styles.rotate} fontSize="large" />,
  games: <GamesIcon className={styles.rotate} fontSize="large" />,
  error: <TrackChangesIcon className={styles.rotate} style={{ color: "red" }} fontSize="large" />,
  done: <ThumbUpAltIcon className={styles.flip} fontSize="large" />,
};

const Home = (props) => {
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("");
  const [isReady, setReady] = useState(false);
  const date = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
    5: "5th",
    6: "6th",
    7: "7th",
    8: "8th",
    9: "9th",
    10: "10th",
    11: "11th",
    12: "12th",
    13: "13th",
    14: "14th",
    15: "15th",
    16: "16th",
    17: "17th",
    18: "18th",
    19: "19th",
    20: "20th",
    21: "21st",
    22: "22nd",
    23: "23rd",
    24: "24th",
    25: "25th",
    26: "26th",
    27: "27th",
    28: "28th",
    29: "29th",
    30: "30th",
    31: "31st",
  };
  const Months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const token = window.localStorage.getItem("token");
  window.onbeforeunload = () => {
    window.localStorage.setItem("mutex", false);
  };
  const createNewGame = () => {
    window.location.replace("/create");
  };

  const playGame = (event) => {
    window.localStorage.setItem(
      "game",
      JSON.stringify(
        games.find((item) => {
          return item._id === event.target.id;
        }),
      ),
    );
    window.location.replace("/play");
  };
  useEffect(() => {
    if (token == null || token === undefined || token.length === 0) {
      window.localStorage.clear();
      window.location.replace("/");
      return false;
    }
    // first fetch user data
    const mutex = window.localStorage.getItem("mutex");
    if (mutex == null || mutex === undefined || mutex === "false") {
      window.localStorage.setItem("mutex", "true");
      setStatus("data");
      axios
        .get("http://localhost:3001/api/database", {
          params: {
            database: "tictactoe",
            collection: "user",
            token: window.localStorage.getItem("token"),
            include: ["email", "name", "username"],
          },
        })
        .then((res) => {
          if (res.data.success === true) {
            window.localStorage.setItem("name", res.data.data[0].name);
            window.localStorage.setItem("email", res.data.data[0].email);
            window.localStorage.setItem("username", res.data.data[0].username);
            // send request to fetch all games owned by this user.
            setStatus("games");
            axios
              .get("http://localhost:3001/api/database", {
                params: {
                  database: "tictactoe",
                  collection: "games",
                  token: window.localStorage.getItem("token"),
                  include: [
                    "_id",
                    "users",
                    "usersinfo",
                    "moves",
                    "timestamp",
                    "state",
                    "finished",
                    "won",
                  ],
                },
              })
              .then((result) => {
                if (result.data.success === true) {
                  result.data.data.sort((a, b) => {
                    return b.timestamp - a.timestamp;
                  });
                  setGames(result.data.data);
                  setStatus("done");
                  setTimeout(() => {
                    setReady(true);
                  }, 1000);
                } else {
                  setStatus("error");
                }
              });
          } else {
            setStatus("error");
          }
        });
    }
    return () => {
      window.localStorage.setItem("mutex", "false");
    };
  }, []);
  if (!isReady) {
    return (
      <Grid container className={styles.container} maxWidth={true} justifyContent={"center"}>
        <Grid item xs={12}>
          <Typography textTransform={"none"} className={styles.label}>
            loading
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <div className={styles.loading}>{loadingEffect[status]}</div>
        </Grid>
      </Grid>
    );
  }
  return (
    <Grid
      container
      maxWidth={true}
      className={styles.container}
      flexDirection={{ xs: "column", sm: "row" }}
      style={{ alignContent: "flex-start" }}
    >
      <Grid
        item
        paddingBottom={3}
        paddingRight={2}
        style={{
          position: "fixed",
          zIndex: "1",
          bottom: 0,
          right: 0,
          display: !(games === undefined || games == null || games.length === 0) ? "block" : "none",
        }}
        textAlign={"left"}
        fontSize={"1.75em"}
      >
        <Button
          className={styles.label}
          style={{
            backgroundColor: "#2f0036",
            borderRadius: 10,
            padding: 10,
            color: "white",
          }}
          onClick={createNewGame}
        >
          <Typography
            textTransform={"none"}
            fontSize={"0.7em"}
            paddingLeft={"0.3em"}
            textAlign={"center"}
          >
            {"+"}
          </Typography>
          <Typography
            textTransform={"none"}
            className={styles.helvetica}
            paddingTop={"0.2em"}
            paddingLeft={"0.5em"}
            paddingRight={"0.5em"}
            fontSize={"0.5em"}
            textAlign={"center"}
          >
            {"New Game"}
          </Typography>
        </Button>
      </Grid>
      <Grid
        item
        flex={1}
        padding={{ xs: 3, md: 5 }}
        paddingBottom={0}
        style={{ width: "100%" }}
        textAlign={"left"}
        fontSize={"1.75em"}
      >
        {/* header */}
        Your Games
      </Grid>
      <Grid
        item
        xs={12}
        flex={13}
        padding={{ xs: 2, md: 4 }}
        paddingBottom={1}
        paddingTop={1}
        textAlign={"left"}
        justifyContent={"center"}
        fontSize={"1.75em"}
      >
        {/* Games*/}
        {!(games === undefined || games == null || games.length === 0) ? (
          <Grid
            container
            spacing={2}
            maxWidth={true}
            className={styles.cardContainer}
            paddingTop={1}
            paddingBottom={1}
          >
            {games.map((game) => {
              const otherUser =
                game.users[0] === window.localStorage.getItem("email")
                  ? game.usersinfo[1][0]
                  : game.usersinfo[0][0];
              const timestamp = new Date(game.timestamp);
              return (
                <Grid item xs={12} key={game._id}>
                  <Card sx={{ borderRadius: 5, padding: { xs: 1, sm: 2, md: 3 } }}>
                    <CardContent>
                      <Typography
                        textTransform={"none"}
                        className={styles.cardLabel}
                        style={{ marginBottom: 15 }}
                      >
                        Game with {otherUser}
                      </Typography>
                      {game.finished === "" ? (
                        <>
                          <Typography
                            textTransform={"none"}
                            style={{ fontSize: "0.6em", fontWeight: 300 }}
                          >
                            {game.moves === window.localStorage.getItem("email")
                              ? `${otherUser} just made their move!`
                              : "You've made your move!"}
                          </Typography>
                          <Typography
                            textTransform={"none"}
                            style={{ fontSize: "0.6em", fontWeight: 300 }}
                          >
                            {game.moves === window.localStorage.getItem("email")
                              ? "It's your turn to play now."
                              : "Waiting for them."}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography
                            textTransform={"none"}
                            style={{ fontSize: "0.6em", fontWeight: 300 }}
                          >
                            {game.finished === "draw"
                              ? "It's a Draw!"
                              : game.finished === window.localStorage.getItem("email")
                              ? "You Won!"
                              : "You Lost!"}
                          </Typography>
                        </>
                      )}
                      <Typography
                        textTransform={"none"}
                        style={{ marginTop: 15, fontWeight: 200 }}
                      >{`${date[timestamp.getDate()]} ${
                        Months[timestamp.getMonth()]
                      } ${timestamp.getFullYear()}, ${
                        timestamp.getHours() > 12 ? timestamp.getHours() - 12 : timestamp.getHours()
                      }:${
                        timestamp.getMinutes() < 10
                          ? "0" + timestamp.getMinutes().toString()
                          : timestamp.getMinutes()
                      }${timestamp.getHours() >= 12 ? "pm" : "am"}`}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        style={{
                          width: "100%",
                          backgroundColor: "#f7cf4a",
                          borderRadius: 10,
                          padding: 10,
                          fontSize: "0.6em",
                          color: "white",
                        }}
                        id={game._id}
                        onClick={playGame}
                      >
                        {game.finished !== "" || game.moves !== window.localStorage.email
                          ? "View game"
                          : "Play!"}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Grid
            container
            className={styles.nogamesContainer}
            maxWidth={true}
            alignContent={"center"}
            style={{
              display: "flex",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: 20,
            }}
          >
            <Grid item xs={12}>
              No Games
            </Grid>
            <Grid item xs={12}>
              Found
            </Grid>
            <Grid item xs={12}>
              <Button
                onClick={createNewGame}
                style={{
                  backgroundColor: "#f7cf4a",
                  width: "100%",
                  borderRadius: 15,
                  color: "white",
                }}
              >
                <Typography textTransform={"none"} fontWeight={600} padding={2}>
                  Start a new game
                </Typography>
              </Button>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
export default Home;
