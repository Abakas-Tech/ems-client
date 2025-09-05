// useDemoInfo.js
import { useContext } from "react";
import { DemoInfoContext } from "./DemoInfoContext";

export const useDemoInfo = () => useContext(DemoInfoContext);
