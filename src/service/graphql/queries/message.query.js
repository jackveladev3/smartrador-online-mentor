import gql from 'graphql-tag'

export default gql`
  query Message($id: ID!){
    message (id: $id) {
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
  }
`
