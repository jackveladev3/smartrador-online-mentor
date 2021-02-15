import gql from 'graphql-tag'

export default gql`
subscription OnMessage($conversationId: ID!) {
  onMessage(conversationId: $conversationId) {
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
