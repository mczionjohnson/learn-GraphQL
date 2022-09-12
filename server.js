const express = require("express")
const { graphqlHTTP } = require("express-graphql")
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require("graphql")

const app = express()


const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

// defining a new schema
// hello world has a message field
// the message field will always return a string
// resolve is a function that tells GraphQL which data to return

// const schema1 = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: 'HelloWorld',
//         fields: () => ({
//             message: { 
//                 type: GraphQLString,
//                 resolve: () => 'Hello world'
//             }
//         })
//     })

// })

// creating a GraphQL custom type for author[]
const AuthorType= new GraphQLObjectType({
    name: 'Author',
    description: 'This represent an author of a book',
    fields: () => ({

        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },

        // populate the books for each author
        book: {
            type: new GraphQLList(BookType),

            // use the parent (author) since we are inside the AuthorType
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
                // use .filter() to iterate and return a list
            }
        }

    })
})

// creating a GraphQL custom type
// the format of presentation of each book (like a mapped data)
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represent a book written by an author',
    fields: () => ({

        // use GraphQLNonNull to make sure it returns data
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt) },

        // creating a relationship to author type
        author: { 
            type: AuthorType,
            
            // use the parent (option of book) to compare
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }

    })
})

// setting up GET request
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',

    // wrap function in ({}) to return by default
    fields: () => ({
        // returns a list of all the books
        books: {
            type: new GraphQLList(BookType),
            description: 'List of Books',
            resolve: () => books
        },
        // so we present each data in books[] by using the format in BookType

        // returns a list of all the authors
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of Authors',
            resolve: () => authors
        },

        // returns a single book
        book: {
            type: BookType,
            description: 'a single Book',

            // define args to be allowed ahead
            // allow only int as arguments in query
            args: {
                id: { type: GraphQLInt }
            },

            // args to be used by params
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },

        // returns a single author
        author: {
            type: AuthorType,
            description: 'a single Authors',

            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
            },

    })
})

// setting up POST, PUT and DELETE requests
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({

        // POST request
        addBook: {
            type: BookType,
            description: 'Add a book',

            // args to be passed by client, name and authorId required
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
                authorId: { type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                // create a book first
                const book = { 
                    id: books.length + 1, 
                    name: args.name, 
                    authorId: args.authorId 
                }
                // add this new book to the array
                books.push(book)

                // return the new book
                return book
            }
        },

        // POST request
        addAuthor: {
            type: AuthorType,
            description: 'Add an Author',

            // args to be passed by client, name of author required
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                // create an author first
                const author = { 
                    id: authors.length + 1, 
                    name: args.name, 
                }
                // add this new book to the array
                authors.push(author)

                // return the new author
                return author
            }
        },
    })
})


// defining the schema
// we query this schema (RootQueryType) to present the data
const schema2 = new GraphQLSchema({
    // query for get request
    query: RootQueryType,

    // mutation for POST, PUT, DELETE
    mutation: RootMutationType
})


app.use('/graphql', graphqlHTTP({
    // schema: schema1,
    schema: schema2,

    graphiql: true
}))



app.listen(5000, () => console.log('server is running on PORT 5000'))