import { STATUS } from './queryStatusType';

export interface MutateFn<TData, TError extends Error, TVariables> {
    mutate: (variables: TVariables) => void;
    mutateAsync: (variables: TVariables) => Promise<TData>;

    status: STATUS;

    data: TData | null;
    error: TError | null;

    reset: () => void;
}

type MutateCallbacks<TData, TError extends Error, TVariables> = {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    onSettled?: (
        data: TData | null,
        error: TError | null,
        variables: TVariables
    ) => void;
};

export type MutateOptions<TData, TError extends Error, TVariables> =
    | ({
          mutateFn: (variables: TVariables) => Promise<TData>;
          invalidateKeys?: any[];
          url?: never;
          method?: never;
          headers?: never;
      } & MutateCallbacks<TData, TError, TVariables>)
    | ({
          invalidateKeys?: any[];
          url: string;
          method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
          mutateFn?: never;
          headers?: HeadersInit;
      } & MutateCallbacks<TData, TError, TVariables>);
