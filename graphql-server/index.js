import { gql, ApolloServer, UserInputError } from "apollo-server";
import axios from "axios";
import { v1 as uuid } from "uuid";

const persons = [
  {
    name: "Brendin",
    phone: "969-670-4731",
    street: "9 Fisk Avenue",
    city: "San Jose",
    id: "36eccf6d-f4c3-4343-99ad-766acd94a380",
  },
  {
    name: "Ellwood",
    phone: "650-973-4612",
    street: "1 Rowland Trail",
    city: "Guéret",
    id: "2f35c1e9-8943-473a-b3e3-c890954a3597",
  },
  {
    name: "Jessa",
    street: "023 Northport Drive",
    city: "Michałów-Reginów",
    id: "d5c37ad3-859e-4a3c-89d8-58a9f016180c",
  },
];

// Formato de los datos
const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }
  type Address {
    street: String!
    city: String!
  }
  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
  }
`;

// De donde sacar los datos
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: async (root, args) => {
      const { data: personsFromRestApi } = await axios.get(
        "http://localhost:3000/persons"
      );
      console.log(personsFromRestApi);

      if (!args.phone) return personsFromRestApi;

      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;

      return personsFromRestApi.filter(byPhone);
    },
    findPerson: (root, { name }) => {
      return personsFromRestApi.find((person) => person.name === name);
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((person) => person.name === args.name)) {
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name,
        });
      }
      const person = { ...args, id: uuid() };
      persons.push(person);
      return person;
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex((p) => p.name === args.name);
      if (personIndex === -1) return null;

      const person = persons[personIndex];

      const updatedPerson = { ...person, phone: args.phone };
      persons[personIndex] = updatedPerson;
      return updatedPerson;
    },
  },
  Person: {
    address: ({ city, street }) => ({
      city,
      street,
    }),
  },
};

// Inicio del servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
