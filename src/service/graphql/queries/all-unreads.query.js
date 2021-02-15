import gql from 'graphql-tag'

export default gql`
query AllUnreads($userId: ID!) {
  allUnreads(
    userId: $userId
  )
}`
