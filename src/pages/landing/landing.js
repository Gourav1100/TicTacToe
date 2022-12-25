import Grid from "@mui/material/Grid";
import { Button } from "@mui/material";
import styles from "./landing.module.css";

const redirect = (event) => {
  const redirectLocation = event.target.innerText.toString().toLowerCase();
  window.location.replace(`/${redirectLocation}`);
};

const Landing = (props) => {
  const token = window.localStorage.getItem("token");
  if (token != null && token !== undefined && token.length !== 0) {
    window.location.replace("/home");
    return <>Redirecting</>;
  }
  return (
    <Grid
      container
      className={styles.container}
      padding={3}
      spacing={3}
      styles={{ display: "flex" }}
      alignContent={"center"}
      justifyContent={"center"}
    >
      <Grid item xs={12} marginBottom={10}>
        <div className={styles.titleContainer}>
          <div>async</div>
          <div>tic tac</div>
          <div>toe</div>
        </div>
      </Grid>
      <Grid item xs={12} className={styles.buttonContainer}>
        <Grid container maxWidth={true} padding={2} rowSpacing={3}>
          <Grid item xs={12}>
            <Button
              style={{ backgroundColor: "#f1c40f" }}
              className={styles.landingButton}
              variant="contained"
              onClick={redirect}
            >
              <div style={{ padding: 5, fontSize: "1.2em" }}>Login</div>
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              color="primary"
              className={styles.landingButton}
              variant="contained"
              onClick={redirect}
            >
              <div style={{ padding: 5, fontSize: "1.2em" }}>Register</div>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Landing;
