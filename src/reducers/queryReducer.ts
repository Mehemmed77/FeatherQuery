import { STATUS } from '../types/queryStatusType';

interface QueryState<T, E = Error> {
    data: T | null;
    error: E | null;
    status: STATUS;
}

export type QueryAction<T, E = Error> =
    | { type: 'LOADING' }
    | { type: 'FETCHING' }
    | { type: 'SUCCESS'; data: T }
    | { type: 'ERROR'; error: E }
    | { type: "RESET"; status: STATUS  };

export function queryReducer<T, E extends Error = Error>(state: QueryState<T, E>, action: QueryAction<T, E>): QueryState<T> {
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

        case "RESET": {
            return {data: null, error: null, status: action.status}
        }
    }
}
