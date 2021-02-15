import { API, graphqlOperation } from 'aws-amplify'
import MailSend from './graphql/queries/send-mail.query'

export const sendMail = async (type, teacherId, parentId, message, conversationId) => {
  const response = await API.graphql(graphqlOperation(
    MailSend,
    { type, teacherId, parentId, message, conversationId },
    process.env.VUE_APP_GRAPHQL_AUTH_TYPE
  ))

  return response.data
}
