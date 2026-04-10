export interface ICreateBlog {
  title: string;
  content: string;
}

export interface IUpdateBlog {
  title?: string;
  content?: string;
}