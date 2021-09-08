import { ModeType } from "../types";

const Mode: ModeType = "production";

export const APPLICATION_URL =
  Mode === "production"
    ? "https://ioinitid.github.io/video-calls/"
    : "http://localhost:3000";
