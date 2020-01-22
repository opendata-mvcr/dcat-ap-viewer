import {register} from "../app/register.js";
import reducer from "./keyword-reducer";

register({
  "reducer": reducer.reducer,
  "name": reducer.name,
});
