import { STATUS } from '../types/queryStatusType';

interface QueryState<T> {
    data: T | null;
    error: Error | null;
    status: STATUS;
}

export type QueryAction<T> =
    | { type: 'LOADING' }
    | { type: 'FETCHING' }
    | { type: 'SUCCESS'; data: T }
    | { type: 'ERROR'; error: Error };

export function queryReducer<T>(state: QueryState<T>, action: QueryAction<T>): QueryState<T> {
    switch (action.type) {
        case "LOADING": {
            return {...state, status: "LOADING"};
        }

        case "FETCHING": {
            return {...state, status: "FETCHING"};
        } 

        case "SUCCESS": {
            const data = action.data;
            return {data: data, error: null, status: "SUCCESS"};
        }

        case "ERROR": {
            const error = action.error;
            return {...state, error: error, status: "ERROR"};
        }
    }
}
