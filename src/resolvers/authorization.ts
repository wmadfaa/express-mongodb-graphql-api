import { ForbiddenError, IFieldResolver } from "apollo-server";
import { combineResolvers, skip } from "graphql-resolvers";

export const isAuthenticated: IFieldResolver<any, any, any> = (
  source,
  context,
  args
) => (args.me ? skip : new ForbiddenError("Not authenticated as user."));

export const isAdmin: IFieldResolver<any, any, any> = combineResolvers(
  isAuthenticated,
  (source, context, args) =>
    args.me.role === "ADMIN"
      ? skip
      : new ForbiddenError("Not authorized as admin.")
);

export const isMessageOwner: IFieldResolver<any, any, any> = async (
  source,
  context,
  args
) => {
  const { id } = context;
  const { models, me } = args;
  const message = await models.Message.findById(id);

  if (message.userId != me.id) {
    throw new ForbiddenError("Not authenticated as owner.");
  }

  return skip;
};
