import jwt from "jsonwebtoken";
import { combineResolvers } from "graphql-resolvers";
import { AuthenticationError, UserInputError } from "apollo-server";

import { isAdmin, isAuthenticated } from "./authorization";
import { IUserDocument } from "../models/user";
import { IResolverObject } from "apollo-server-express";

const createToken = async (
  user: IUserDocument,
  secret: jwt.Secret,
  expiresIn: string | number
) => {
  const { id, email, username, role } = user;
  return await jwt.sign({ id, email, username, role }, secret, {
    expiresIn
  });
};

const resolver: IResolverObject<any, any> = {
  Query: {
    users: async (source, context, args) => {
      const { models } = args;
      return await models.User.find();
    },
    user: async (source, context, args) => {
      const { id } = context;
      const { models } = args;
      return await models.User.findById(id);
    },
    me: async (source, context, args) => {
      const { me, models } = args;
      if (!me) {
        return null;
      }

      return await models.User.findById(me.id);
    }
  },

  Mutation: {
    signUp: async (source, context, args) => {
      const { username, email, password } = context;
      const { models, secret } = args;
      const user = await models.User.create({
        username,
        email,
        password
      });

      return { token: createToken(user, secret, "30m") };
    },

    signIn: async (source, context, args) => {
      const { login, password } = context;
      const { models, secret } = args;
      const user = await models.User.findByLogin(login);

      if (!user) {
        throw new UserInputError("No user found with this login credentials.");
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError("Invalid password.");
      }

      return { token: createToken(user, secret, "30m") };
    },

    updateUser: combineResolvers(
      isAuthenticated,
      async (source, context, args) => {
        const { username } = context;
        const { models, me } = args;
        return await models.User.findByIdAndUpdate(
          me.id,
          { username },
          { new: true }
        );
      }
    ),

    deleteUser: combineResolvers(isAdmin, async (source, context, args) => {
      const { id } = context;
      const { models } = args;
      const user = await models.User.findById(id);

      if (user) {
        await user.remove();
        return true;
      } else {
        return false;
      }
    })
  },

  User: {
    messages: async (source, context, args) => {
      const { models } = args;
      return await models.Message.find({
        userId: source.id
      });
    }
  }
};

export default resolver;
