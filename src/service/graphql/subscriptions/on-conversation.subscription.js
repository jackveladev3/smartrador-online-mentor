import gql from 'graphql-tag'

export default gql`
subscription OnConversation($userId: ID!) {
  onConversation(userId: $userId) {
    id,
    userId,
    userType,
    user {
      id,
      initial,
      photoId,
      photoFlag,
      sex
    }
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
