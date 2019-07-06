import { combineResolvers } from "graphql-resolvers";

import pubsub, { EVENTS } from "../subscription";
import { isAuthenticated, isMessageOwner } from "./authorization";
import { IResolverObject } from "graphql-tools";

const toCursorHash = (string: string): string =>
  Buffer.from(string).toString("base64");

const fromCursorHash = (string: string): string =>
  Buffer.from(string, "base64").toString("ascii");

const resolver: IResolverObject<any, any> = {
  Query: {
    messages: async (source, context, args) => {
      const { cursor, limit = 100 } = context;
      const { models } = args;
      const cursorOptions = cursor
        ? {
            createdAt: {
              $lt: fromCursorHash(cursor)
            }
          }
        : {};
      const messages = await models.Message.find(cursorOptions, null, {
        sort: { createdAt: -1 },
        limit: limit + 1
      });

      const hasNextPage = messages.length > limit;
      const edges = hasNextPage ? messages.slice(0, -1) : messages;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: toCursorHash(edges[edges.length - 1].createdAt.toString())
        }
      };
    },
    message: async (source, context, args) => {
      const { id } = context;
      const { models } = args;
      return await models.Message.findById(id);
    }
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (source, context, args) => {
        const { text } = context;
        const { models, me } = args;
        const message = await models.Message.create({
          text,
          userId: me.id
        });

        pubsub.publish(EVENTS.MESSAGE.CREATED, {
          messageCreated: { message }
        });

        return message;
      }
    ),

    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (source, context, args) => {
        const { id } = context;
        const { models } = args;
        const message = await models.Message.findById(id);

        if (message) {
          await message.remove();
          return true;
        } else {
          return false;
        }
      }
    )
  },

  Message: {
    user: async (source, context, args) => {
      const { loaders } = args;
      return await loaders.user.load(source.userId);
    }
  },

  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED)
    }
  }
};

export default resolver;
