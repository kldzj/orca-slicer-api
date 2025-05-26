import express from "express";
import profiles from "./routes/profiles/route";
import slicing from "./routes/slicing/route";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/profiles", profiles);
app.use("/slice", slicing);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
