import { Button, Grid, Typography } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import styles from "./create.module.css";
import { useState } from "react";
import axios from "axios";

const fields = [
  {
    key: "email",
    title: "Email",
    type: "email",
    regex: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+/gi,
  },
];

const Create = (props) => {
  const [isSubmitAvailable, setSubmitAvailability] = useState(true);
  const [Alert, setAlert] = useState("");
  const [AlertColor, setAlertColor] = useState("#00de96");
  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitAvailability(false);
    let areAllInputsValid = true;
    fields.map((item) => {
      let matches = event.target[item.key].value.toString().match(item.regex);
      if (matches === null || matches === undefined || matches.length !== 1) {
        areAllInputsValid = false;
      }
      return true;
    });
    if (!areAllInputsValid) {
      setAlert("Enter correct details.");
      setAlertColor("#ff1457");
      setSubmitAvailability(true);
      return false;
    }
    // send request and validate
    axios
      .post("http://localhost:3001/api/database", {
        query: {
          email: event.target.email.value,
        },
        token: window.localStorage.getItem("token"),
        database: "tictactoe",
        collection: "games",
      })
      .then((res) => {
        if (res.data.success === false) {
          setAlert(res.data.message);
          setAlertColor("#ff1457");
          setSubmitAvailability(true);
        } else if (res.data.success === true) {
          console.log(res.data.data);
          setAlert("Game created successfully. Redirecting...");
          setAlertColor("#00de96");
          setTimeout(() => {
            window.localStorage.setItem("game", JSON.stringify(res.data.data));
            window.location.replace("/play");
          }, 1500);
        }
      });
    return true;
  };
  const token = window.localStorage.getItem("token");
  if (token == null || token === undefined || token.length === 0) {
    window.localStorage.clear();
    window.location.replace("/");
    return <>Redirecting</>;
  }
  return (
    <Grid
      container
      className={styles.container}
      style={{ display: "flex" }}
      flexDirection={"column"}
      justifyContent={"center"}
      alignContent={"center"}
    >
      <Grid style={{ flex: 2 }} item xs={12} padding={2}>
        <Grid
          container
          maxWidth={true}
          padding={1}
          style={{
            display: "flex",
            position: "fixed",
            left: 0,
            right: 0,
          }}
        >
          <Grid padding={1} textAlign={"left"} item xs={12}>
            <Button
              style={{ color: "black" }}
              onClick={() => {
                window.location.replace("/");
              }}
            >
              <ArrowBackIosIcon />
            </Button>
          </Grid>
          <Grid
            className={styles.title}
            padding={1}
            paddingLeft={4}
            textAlign={"left"}
            item
            xs={12}
          >
            Start a new game
          </Grid>
          <Grid
            className={styles.title}
            padding={1}
            paddingLeft={4}
            textAlign={"left"}
            item
            xs={12}
          >
            <div>Whom do you want</div>
            <div>to play with?</div>
          </Grid>
        </Grid>
      </Grid>
      <Grid style={{ flex: 11 }} item xs={12} padding={2} marginTop={4}>
        <form onSubmit={handleSubmit}>
          <Grid
            container
            maxWidth={true}
            padding={1}
            style={{
              display: "flex",
              position: "fixed",
              left: 0,
              right: 0,
            }}
          >
            {fields.map((item) => {
              return (
                <Grid
                  item
                  xs={12}
                  paddingLeft={4}
                  paddingRight={8}
                  paddingTop={1}
                  textAlign="left"
                  key={item.key}
                >
                  <Typography textTransform={"none"} mt={1} mb={1} style={{ fontWeight: 500 }}>
                    {item.title}
                  </Typography>
                  <input
                    onFocus={() => {
                      if (Alert.length !== 0) {
                        setAlert("");
                        setAlertColor("#00de96");
                      }
                    }}
                    placeholder={`Type your ${item.key} here`}
                    autoSave="off"
                    autoComplete="off"
                    name={item.key}
                    type={item.type}
                    className={styles.inputs}
                    style={{ padding: 18 }}
                    disabled={!isSubmitAvailable}
                  ></input>
                </Grid>
              );
            })}
            <Grid
              item
              xs={12}
              paddingLeft={4}
              paddingRight={4}
              paddingBottom={2}
              textAlign="left"
              style={{
                position: "fixed",
                width: "100%",
                bottom: 0,
              }}
            >
              <Typography
                textTransform={"none"}
                marginBottom={1}
                className={styles.alert}
                style={{
                  display: Alert === "" ? "none" : "block",
                  backgroundColor: AlertColor,
                  padding: 20,
                  color: "white",
                  fontSize: "1.1em",
                  borderRadius: 10,
                }}
              >
                {Alert}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                style={{ padding: 15, borderRadius: 10, width: "100%" }}
                className={styles.submitButton}
                disabled={!isSubmitAvailable}
              >
                Start game
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};

export default Create;
