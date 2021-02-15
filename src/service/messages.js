import { API, graphqlOperation } from 'aws-amplify'
import MessageCreate from './graphql/mutations/create-message.mutation'
import GetMessageList from './graphql/queries/all-messages.query'
import GetMessage from './graphql/queries/message.query'
import OnMessageSubscription from './graphql/subscriptions/on-message.subscription'
import OnMessageUpdateReadedSubscription from './graphql/subscriptions/on-message-update-readed.subscription'
import MessageUpdate from './graphql/mutations/update-message.mutation'

export const createMessage = async (input) => {
  const response = await API.graphql(graphqlOperation(
    MessageCreate,
    { input },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response.data.createMessage
}

export const getMessageList = async (conversationId, after, first) => {
  const response = await API.graphql(graphqlOperation(
    GetMessageList,
    { conversationId, after, first },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response.data.allMessages
}

export const getMessage = async (id) => {
  const response = await API.graphql(graphqlOperation(
    GetMessage,
    { id },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response.data.message
}

export const onMessage = async (conversationId) => {
  const response = await API.graphql(graphqlOperation(
    OnMessageSubscription,
    { conversationId },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response
}

export const OnMessageUpdateReaded = async (conversationId, ownerId) => {
  const response = await API.graphql(graphqlOperation(
    OnMessageUpdateReadedSubscription,
    { conversationId, ownerId },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response
}

export const updateMessage = async (input) => {
  const response = await API.graphql(graphqlOperation(
    MessageUpdate,
    { input },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response.data.updateMessage
}
