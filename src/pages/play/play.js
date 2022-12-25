import { Button, Grid, Typography } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import styles from "./play.module.css";

const colors = {
  cross: "#2c77ff",
  circle: "#ff0050",
};
let socket = null;

const Icon = (props) => {
  if (props.type === "circle") {
    return <CircleOutlinedIcon style={{ fontSize: "3em", color: colors[props.type] }} />;
  } else if (props.type === "cross") {
    return <ClearRoundedIcon style={{ fontSize: "3em", color: colors[props.type] }} />;
  }
  return <></>;
};

const Play = () => {
  const [Game, setGame] = useState(window.localStorage.getItem("game"));
  const token = window.localStorage.getItem("token");
  const [height, setHeight] = useState(0);
  const [statusBar, setStatusBar] = useState(
    socket === null ||
      socket === undefined ||
      socket.connected === undefined ||
      socket.connected === false
      ? "connecting..."
      : "",
  );
  const [isOnline, setOnline] = useState("Offline");
  let game = Game;
  const [status, setStatus] = useState("");
  useEffect(() => {
    socket = io("ws://localhost:4000");
    socket.on("connect", () => {
      setStatusBar("connected. handshaking...");
      socket.emit("handshake", {
        token: token,
        email:
          game.users[0] === window.localStorage.getItem("email") ? game.users[1] : game.users[0],
      });
    });
    socket.on("handshakeResponse", (data) => {
      if (data.success === true) {
        setStatusBar("connected. handshaking done. starting game...");
        setOnline(data.online === true ? "Online" : "Offline");
        setTimeout(() => {
          setStatusBar("");
        }, 1000);
      } else {
        setStatus("connected. handshake failed! reloading...");
        setTimeout(() => {
          window.location.replace();
        }, 3000);
      }
    });
    socket.on("updateGameResponse", (newGame) => {
      if (newGame.success === true) {
        window.localStorage.setItem("game", JSON.stringify(newGame.data));
        setGame(JSON.stringify(newGame.data));
      } else {
        if (newGame.data !== undefined || newGame.data != null) {
          window.localStorage.setItem("game", JSON.stringify(newGame.data));
          setStatusBar(newGame.message);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setStatusBar(newGame.message);
          setTimeout(() => {
            window.localStorage.clear();
            window.location.replace("/");
          }, 1000);
        }
      }
    });
    socket.on("updateOnline", (data) => {
      setOnline(data.online === true ? "Online" : "Offline");
    });
    socket.on("disconnect", () => {
      var timeout = 3;
      const interval = setInterval(() => {
        setStatusBar(`disconnected. reloading in ${timeout} sec.`);
        timeout--;
        if (timeout === 0) {
          clearInterval(interval);
          if (socket.connected === false) {
            window.location.reload();
          } else {
            setStatusBar("connected. handshaking...");
          }
        }
      }, 1000);
    });
    let totalHeight = 0;
    for (var id = 1; id <= 6; id++) {
      totalHeight += document.getElementById(id.toString()).clientHeight;
    }
    totalHeight = document.getElementById("gameContainer").clientHeight - totalHeight;
    const factor = 4;
    const finalHeight = totalHeight / factor;
    const finalWidth = document.getElementById("3").clientWidth / 3;
    setHeight(Math.min(finalHeight, finalWidth));
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    setStatus(
      game.finished === ""
        ? game.moves === window.localStorage.getItem("email")
          ? "Your move"
          : "Their move"
        : game.finished === "draw"
        ? "It's a Draw!"
        : game.finished === window.localStorage.getItem("email")
        ? "You win"
        : "You lost",
    );
  }, [Game]);
  if (token == null || token === undefined || token.length === 0) {
    window.localStorage.clear();
    window.location.replace("/");
    return <>Redirecting</>;
  }
  if (game == null || game === undefined || game === "" || typeof game !== typeof "") {
    window.location.replace("/");
    return <>Redirecting</>;
  }
  game = JSON.parse(game);
  const otherUser =
    game.users[0] === window.localStorage.getItem("email")
      ? game.usersinfo[1][0]
      : game.usersinfo[0][0];
  window.onresize = () => {
    let totalHeight = 0;
    for (var id = 1; id <= 6; id++) {
      totalHeight += document.getElementById(id.toString()).clientHeight;
    }
    totalHeight = document.getElementById("gameContainer").clientHeight - totalHeight;
    const factor = 4;
    const finalHeight = totalHeight / factor;
    const finalWidth = document.getElementById("3").clientWidth / 3;
    setHeight(Math.min(finalHeight, finalWidth));
  };
  const restartGame = (event) => {
    if (socket.connected === true) {
      socket.emit("restartGame", {
        game: JSON.parse(Game),
        token: localStorage.getItem("token"),
        email: localStorage.getItem("email"),
      });
    }
  };
  const updateState = (event) => {
    const selector = parseInt(event.target.getAttribute("selector"));
    let updatedGame = JSON.parse(window.localStorage.getItem("game"));
    updatedGame.state[selector] =
      updatedGame.state[selector] === ""
        ? window.localStorage.getItem("email")
        : updatedGame.state[selector];
    setGame(JSON.stringify(updatedGame));
  };
  const updateDatabase = (event) => {
    if (socket.connected === true) {
      socket.emit("updateGame", JSON.parse(Game));
    }
  };
  return (
    <Grid className={styles.container} container maxWidth={true} padding={1} id="gameContainer">
      <Grid item xs={12}>
        <Grid container maxWidth={true}>
          <Grid id="1" item textAlign={"left"} xs={6}>
            <Button
              style={{ color: "black", borderRadius: "100%" }}
              onClick={() => {
                socket.disconnect();
                window.location.replace("/");
              }}
            >
              <Typography textTransform={"none"} padding={1}>
                <ArrowBackIosIcon />
              </Typography>
            </Button>
          </Grid>
          <Grid id="2" item textAlign={"right"} xs={6}>
            <Typography textTransform={"none"} padding={1}>
              {isOnline}
            </Typography>
          </Grid>
          <Grid
            id="3"
            item
            className={styles.label}
            padding={2}
            paddingBottom={1}
            textAlign={"left"}
            xs={12}
          >
            <div>Game with {otherUser}</div>
          </Grid>
          <Grid
            id="4"
            item
            className={styles.labelnoDecor}
            padding={2}
            paddingTop={1}
            paddingBottom={0}
            textAlign={"left"}
            xs={12}
          >
            <Typography textTransform={"none"} fontWeight={300}>
              Your piece
            </Typography>
          </Grid>
          <Grid
            item
            id="5"
            className={styles.icon}
            padding={2}
            paddingTop={1}
            textAlign={"left"}
            xs={12}
          >
            <div>
              <Icon type="cross" />
            </div>
          </Grid>
          <Grid
            id="6"
            item
            className={styles.labelnoDecor}
            padding={2}
            paddingTop={1}
            paddingBottom={2}
            style={{ backgroundColor: "#ffed9d", borderRadius: 5 }}
            textAlign={"center"}
            xs={12}
          >
            <Typography textTransform={"none"} fontSize={"1.15em"} fontWeight={300}>
              {status}
            </Typography>
          </Grid>
          {[0, 1, 2].map((selectorX) => {
            return (
              <Grid item xs={12} key={selectorX.toString()}>
                <Grid container maxWidth={true}>
                  {[0, 1, 2].map((selectorY) => {
                    return (
                      <Grid
                        key={(selectorX * 3 + selectorY).toString()}
                        className={`${selectorX === 1 ? styles.middleX : ""} ${
                          selectorY === 1 ? styles.middleY : ""
                        }`}
                        item
                        xs={4}
                        style={{ height: `${height}px` }}
                      >
                        <Button
                          selector={(selectorX * 3 + selectorY).toString()}
                          onClick={updateState}
                          className={styles.gameButton}
                          disabled={
                            statusBar !== "" ||
                            game.state[selectorX * 3 + selectorY] !== "" ||
                            game.moves !== window.localStorage.getItem("email")
                              ? true
                              : false
                          }
                        >
                          {game.state[selectorX * 3 + selectorY] === "" ? (
                            ""
                          ) : (
                            <Icon
                              type={
                                game.state[selectorX * 3 + selectorY] ===
                                window.localStorage.getItem("email")
                                  ? "cross"
                                  : "circle"
                              }
                            />
                          )}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            );
          })}
          <Grid
            item
            xs={12}
            padding={1}
            paddingBottom={2}
            className={styles.updateGameButtonContainer}
          >
            <Typography>{statusBar}</Typography>
            <button
              onClick={game.finished === "" ? updateDatabase : restartGame}
              className={
                statusBar === "" &&
                ((game.moves === window.localStorage.getItem("email") &&
                  Game !== window.localStorage.getItem("game")) ||
                  game.finished !== "")
                  ? styles.updateGameButton
                  : styles.updateGameButtonDisabled
              }
              style={{ borderRadius: 10, padding: 15 }}
              disabled={
                statusBar === "" &&
                ((game.moves === window.localStorage.getItem("email") &&
                  Game !== window.localStorage.getItem("game")) ||
                  game.finished !== "")
                  ? false
                  : true
              }
            >
              <Typography textTransform={"none"} color="white" fontSize={"1.3em"}>
                {game.finished === ""
                  ? game.moves === localStorage.getItem("email")
                    ? "Submit!"
                    : `Waiting for ${otherUser}`
                  : "Start another game"}
              </Typography>
            </button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Play;
