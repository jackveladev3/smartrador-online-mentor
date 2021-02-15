import gql from 'graphql-tag'

export default gql`
mutation UpdateConversation($input: ConversationUpdateInput!) {
  updateConversation(input: $input) {
    id,
    userId,
    userType,
    user {
      id,
      initial,
      photoId,
      photoFlag,
      sex
    },
    opponentId,
    opponentType,
    opponent {
      id,
      initial,
      photoId,
      photoFlag,
      sex
    },
    title,
    lastMessageId,
    updatedAt,
    unreads
  }
}`
