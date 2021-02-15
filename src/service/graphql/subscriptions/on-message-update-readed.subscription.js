import gql from 'graphql-tag'

export default gql`
subscription OnMessageUpdateReaded($conversationId: ID!, $ownerId: ID!) {
  onMessageUpdateReaded(
    conversationId: $conversationId,
    ownerId: $ownerId
  ) {
    id,
    createdAt,
    ownerId,
    ownerType,
    opponentType,
    opponentId,
    conversationId,
    readedAt,
    content
  }
}`
