import gql from "graphql-tag";

const PaginationInput = `page:Int pageSize:Int`;
const PaginationResponse = gql`
    interface PaginationResponse{
        total:Int
    }
`;
export { PaginationInput, PaginationResponse };
