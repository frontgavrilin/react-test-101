import { gql } from "@apollo/client";

export const PROVIDERS_QUERY = gql`
  query PROVIDERS_QUERY(
    $filter: String
    $limit: Int!
    $offset: Int!
    $sort: String
  ) {
    providers(filter: $filter, limit: $limit, offset: $offset, sort: $sort) {
      data {
        id
        name
        url_name
        logo
        region {
          id
          name
          url
        }
        info {
          cnt_tariffs
        }
      }
    }
  }
`;
