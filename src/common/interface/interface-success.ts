export interface ISuccess<T = any> {
  statusCode: number;
  data: T;
}