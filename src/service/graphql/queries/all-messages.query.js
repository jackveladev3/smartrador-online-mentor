import gql from 'graphql-tag'

export default gql`
query AllMessages($conversationId: ID!, $after: String, $first: Int) {
  allMessages(
    conversationId: $conversationId,
    after: $after,
    first: $first
  ) {
    items {
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
    nextToken
  }
}`
