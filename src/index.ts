import express from "express";
import dotenv from "dotenv";

const app = express();

dotenv.config();

console.log(`Log info: port set to: ${process.env.PORT}`);
