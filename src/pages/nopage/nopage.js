import { Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import styles from "./nopage.module.css";

const returnBack = (event) => {
  window.location.replace("/");
};

const Nopage = (props) => {
  return (
    <Grid
      container
      className={styles.container}
      styles={{ display: "flex" }}
      justifyContent="center"
      alignContent={"center"}
    >
      <Grid item xs={12} className={styles.giffyBackground}>
        {/* contains gif in background */}
      </Grid>
      <Grid item xs={12} className={styles.Text}>
        What are you doing here?
      </Grid>
      <Grid item xs={12}>
        <Button
          className={styles.iconButton}
          style={{ margin: 5 }}
          aria-label="return"
          onClick={returnBack}
        >
          <ArrowBackIosIcon style={{ color: "black", margin: "20 15 20 20" }} />
        </Button>
      </Grid>
    </Grid>
  );
};

export default Nopage;
