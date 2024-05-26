const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const { buildSchema } = require('graphql');
const dotenv = require('dotenv');
const User = require('./models/User');  // Importiere das Modell

dotenv.config();

const app = express();

// MongoDB-Verbindung
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// GraphQL-Schema
const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    hello: String
    getUser(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): String
  }
`);

const root = {
    hello: () => {
        return 'Test123';
    },
    getUser: async ({ id }) => {
        return await User.findById(id);
    },
    createUser: async ({ name, email }) => {
        const user = new User({ name, email });
        await user.save();
        return user;
    },
    updateUser: async ({ id, name, email }) => {
        return await User.findByIdAndUpdate(id, { name, email }, { new: true });
    },
    deleteUser: async ({ id }) => {
        await User.findByIdAndDelete(id);
        return 'User deleted';
    }
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/graphql`);
});
