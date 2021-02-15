import { API, graphqlOperation } from 'aws-amplify'
import ConversationCreate from './graphql/mutations/create-conversation.mutation'
import GetConversationList from './graphql/queries/all-conversations.query'
import OnConversationSubscription from './graphql/subscriptions/on-conversation.subscription'
import ConversationUpdate from './graphql/mutations/update-conversation.mutation'

export const createConversation = async (input) => {
  const response = await API.graphql(graphqlOperation(
    ConversationCreate,
    { input },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response.data.createConversation
}

export const getConversationList = async (userId, after, first) => {
  const response = await API.graphql(graphqlOperation(
    GetConversationList,
    { userId, after, first },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response.data.allConversations
}

export const onConversation = async (userId) => {
  const response = await API.graphql(graphqlOperation(
    OnConversationSubscription,
    { userId },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response
}

export const updateConversation = async (input) => {
  const response = await API.graphql(graphqlOperation(
    ConversationUpdate,
    { input },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response.data.updateConversation
}
