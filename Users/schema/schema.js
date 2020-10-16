const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLSchema //takes a Rootquerry and return a schema
}= graphql;
const axios = require("axios");

const CompanyType = new GraphQLObjectType({
    name:'Company',
    fields:()=>({
        id:{type: GraphQLString},
        name:{type:GraphQLString},
        description:{type: GraphQLString},
        workers:{
            type: new GraphQLList(UserType),
            resolve(parentValue,args){
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(res=>res.data)
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    fields:()=>({
        id:{type:GraphQLString},
        firstName:{type:GraphQLString},
        age:{type:GraphQLInt},
        company:{
            type:CompanyType,
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res=> res.data)
            }
        
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQuerryType',
    fields:{
     user:{
        type: UserType,
        args: {id: {type: GraphQLString }},
        resolve(parentValue, args){
            return axios.get(`http://localhost:3000/users/${args.id}`)
            .then(res=>res.data)
        }
    },
    company:{
        type:CompanyType,
        args:{id:{type:GraphQLString}},
        resolve(parentValue, args){
            return axios.get(`http://localhost:3000/companies/${args.id}`)
                .then(res=>res.data)
        }
    },
    users:{
        type: new GraphQLList(UserType),
        resolve(parentValue, args){
            return axios.get(`http://localhost:3000/users`)
            .then(res=>res.data)
        }
    },
    companies:{
        type: new GraphQLList(CompanyType),
        resolve(parentValue, args){
            return axios.get(`http://localhost:3000/companies`)
            .then(res=>res.data)     
        }
    }
}
})

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields:{
        addUser:{
            type:UserType,
            args:{
                firstName:{type: new GraphQLNonNull(GraphQLString)},
                age:{type: new GraphQLNonNull(GraphQLInt)},
                companyId:{type: GraphQLString}
            },
            resolve(parentValue, {firstName, age}){
                return axios.post(`http://localhost:3000/users`, {firstName, age})
                    .then(res => res.data);

            }
        },
        deleteUser:{
            type: UserType,
            args:{
                id:{type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parentValue, args){
                return axios.delete(`http://localhost:3000/users/${args.id}`)
                    .then(res=>res.data)
            }
        },
        updateUser:{
            type: UserType,
            args:{
                id: {type: new GraphQLNonNull(GraphQLString)},
                firstName:{type: GraphQLString},
                age: {type: GraphQLInt},
                companyId:{type: GraphQLString}
            },
            resolve(parentValue, args){
                return axios.patch(`http://localhost:3000/users/${args.id}`, args)
                    .then(re=>re.data)
            }
        }
    }


})
module.exports= new GraphQLSchema({
    query: RootQuery,
    mutation
})