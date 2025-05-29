import express from "express";
import profiles from "./routes/profiles/route";
import slicing from "./routes/slicing/route";
import { errorHandler } from "./middleware/error";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/profiles", profiles);
app.use("/slice", slicing);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
