import gql from 'graphql-tag'

export default gql`
query Conversation($userId: ID!, $opponentId: ID!, $title: String!) {
  conversation (
    userId: $userId
    opponentId: $opponentId,
    title: $title
  ) {
    id,
    userId,
    userType,
    user {
      id,
      initial,
      photoId,
      photoFlag,
      sex,
    },
    opponentId,
    opponentType,
    opponent {
      id,
      initial,
      photoId,
      photoFlag,
      sex,
      isBusiness,
      businessDescription
    },
    title,
    lastMessageId,
    updatedAt,
    unreads
  }
}`
