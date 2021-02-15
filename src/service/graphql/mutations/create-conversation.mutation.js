import gql from 'graphql-tag'

export default gql`
mutation CreateConversation($input: ConversationCreateInput!) {
  createConversation(
    input: $input
  ) {
    updatedAt,
    userId,
    userType,
    user {
      id,
      initial,
      photoId,
      photoFlag,
      sex
    },
    id,
    title,
    opponentId,
    opponentType,
    opponent {
      id,
      initial,
      photoId,
      photoFlag,
      sex
    },
    unreads
  }
}`
