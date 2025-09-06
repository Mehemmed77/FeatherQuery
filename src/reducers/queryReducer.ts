import { STATUS } from '../types/queryStatusType';

interface QueryState<T, E = Error> {
    data: T | null;
    response: T | null;
    error: E | null;
    status: STATUS;
}

export type QueryAction<T, E = Error> =
    | { type: "STATIC" }
    | { type: 'LOADING' }
    | { type: 'FETCHING' }
    | { type: 'SUCCESS'; data: T }
    | { type: 'ERROR'; error: E }
    | { type: "RESET"; status: STATUS  }
    | { type: "REFETCH_START", cachedData: T }
    | { type: "SUCCESS_RESPONSE", response: T }

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
            return {...state, data: data, error: null, status: "SUCCESS"};
        }

        case "SUCCESS_RESPONSE": {
            const response = action.response;
            return {...state, response: response};
        }

        case "REFETCH_START": {
            const cachedData = action.cachedData;
            return { ...state, data: cachedData, status:"FETCHING" }
        }

        case "ERROR": {
            const error = action.error;
            return {...state, error: error, status: "ERROR"};
        }

        case "RESET": {
            return {data: null, error: null, response: null, status: action.status}
        }

        case "STATIC": {
            return {data: null, error: null, response: null, status: "STATIC"}
        } 
    }
}
