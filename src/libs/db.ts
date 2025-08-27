import config from "../constant/config";
import mongoose from 'mongoose';
import logger from "../utils/logger";

mongoose.connect(config.mongo.uri).then(() => {
  logger.info('Connected to MongoDB successfully');
})

export { mongoose };
