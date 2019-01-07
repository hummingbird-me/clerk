import { ApolloServer } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from './types';
import loadResolvers from './resolvers';
import knex from 'knex';
import { S3 } from 'aws-sdk';
import { Config } from './config';

export default async function API (config: Config) {
  const resolvers = await loadResolvers();
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const sources = {
    db: knex(config.db),
    s3: new S3(config.s3)
  };

  const server = new ApolloServer({
    schema,
    resolvers,
    context: () => sources
  });

  return server.listen();
}
