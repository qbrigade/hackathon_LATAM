export type Nullish<T> = T | null | undefined;

export type NoNullKeys<T> = {
  [P in keyof T]:
  T[P] extends null ?
  null :
  T[P] extends null | infer R ?
  R :
  T[P];
};
