import { STATUS } from "./mutateStatusType";

export interface MutateFn<TData, TError, TVariables> {
    mutate: (variables: TVariables) => void;
    mutateAsync: (variables: TVariables) => Promise<TData>;

    status: STATUS

    data: TData | null;
    error: TError | null;

    reset: () => void;
}

type MutateCallbacks<TData, TError, TVariables> = {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    onSettled?: (
        data: TData | null,
        error: TError | null,
        variables: TVariables
    ) => void;
};

export type MutateOptions<TData, TError, TVariables> =
    | ({
          mutateFn: (variables: TVariables) => Promise<TData>;
          url?: never;
          method?: never;
          headers?: never;
      } & MutateCallbacks<TData, TError, TVariables>)
    | ({
          url: string;
          method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
          mutateFn?: never;
          headers?: HeadersInit;
      } & MutateCallbacks<TData, TError, TVariables>);
