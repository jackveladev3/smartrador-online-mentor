import gql from 'graphql-tag'

export default gql`
subscription OnMessageUpdate($opponentId: ID!) {
  onMessageUpdate(opponentId: $opponentId) {
    id,
    createdAt,
    ownerId,
    ownerType,
    opponentType,
    opponentId,
    conversationId,
    readedAt,
    content,
    requestId,
    review
  }
}`
