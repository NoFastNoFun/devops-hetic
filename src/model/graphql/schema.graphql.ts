export const GRAPHQL_SCHEMA = `#graphql

type User {
  userId: Int!             # Not null
  familyName: String
  givenName: String
  email: String!           # Not null
  files: [UserFile!]
}

type UserFile {
  fileId: Int!              
  userId: Int!
  storageKey: String!
  filename: String
  mimeType: String!     
}

type Query {
  users: [User]
  user(userId: Int!): User
}

input UserDetails {
  familyName: String
  givenName: String
}

type Mutation {
  addUser(email: String!, familyName: String, givenName: String): User
  updateUser(userId: Int!, user: UserDetails!): User
  deleteUser(userId: Int!): Boolean
}
`