import gql from 'graphql-tag'

export default gql`
subscription OnConversationUpdate($userId: ID!) {
  onConversationUpdate(userId: $userId) {
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
