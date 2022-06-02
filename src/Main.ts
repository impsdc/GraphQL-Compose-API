import { Schema } from "graphql-composer-decorators";
import { ApolloServer } from "apollo-server";
import { Connection, createConnection } from "typeorm";
import { config } from "dotenv";
import { printSchema } from "graphql";
import { fstat, writeFile } from "fs";
import { ArgsFactory } from "graphql-composer-typeorm";
import { verify } from "jsonwebtoken";

config({
  path: `${__dirname}/../.env`,
});

export class Main {
  private static _instance: Main;
  private _server: ApolloServer;
  private _connection: Connection;
  private _schema: Schema;

  static get instance() {
    if (!this._instance) {
      this._instance = new Main();
    }
    return this._instance;
  }

  get connection() {
    return this._connection;
  }

  get server() {
    return this._server;
  }

  get schema() {
    return this._schema;
  }

  async start() {
    this._connection = await createConnection({
      type: "mysql",
      // username: "santamaria",
      // password: "santamaria",
      // port: 3308,
      username: "root",
      password: "root",
      port: 3306,
      database: "pictsManager",
      entities: [`${__dirname}/models/*.ts`],
      synchronize: true,
      charset: "utf8mb4_unicode_ci",
    });

    this._schema = Schema.create()
      .setConfig({
        requiredByDefault: true,
      })
      .load(`${__dirname}/models/*.ts`, `${__dirname}/resolvers/*.ts`)
      .addTypes(...ArgsFactory.types);

    const compiledSchema = this._schema.build();

    writeFile(
      `${__dirname}/schema.graphql`,
      printSchema(compiledSchema),
      () => {},
    );

    this._server = new ApolloServer({
      schema: compiledSchema,
      tracing: true,
      context: async ({ req }) => {
        const token = req.headers.authorization || req.headers.token || "";

        try {
          const decoded = await verify(token, process.env.JWT_SECRET);
          return { user: decoded, token };
        } catch (err) {
          return { token };
        }
      },
    });

    await this._server.listen(4000, () => {
      console.log("Server listening...");
    });
  }
}
