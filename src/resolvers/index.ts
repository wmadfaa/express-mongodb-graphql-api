import { GraphQLDateTime } from "graphql-iso-date";

import userResolvers from "./user";
import messageResolvers from "./message";
import { IResolvers } from "graphql-tools";

const customScalarResolver = {
  Date: GraphQLDateTime
};

const resolvers: any = [customScalarResolver, userResolvers, messageResolvers];

export default resolvers;
