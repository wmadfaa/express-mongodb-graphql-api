import { IModels } from "../models";

export const batchUsers = async (keys: string[], models: IModels) => {
  const users = await models.User.find({
    _id: {
      $in: keys
    }
  });

  return keys.map(key => users.find(user => user.id == key));
};
