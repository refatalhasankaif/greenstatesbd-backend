export interface IPaginationQuery {
  page?: string;
  limit?: string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export const getPagination = (query: IPaginationQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};