import { PagedDataEntries, PagedDataEntry } from '../types/infiniteQuery';
import { STATUS } from '../types/status';

interface QueryState<T, TPageParam> {
    data: PagedDataEntries<T, TPageParam> | null;
    pageParam: TPageParam;
    status: STATUS;
    error: Error | null;
}

export type QueryAction<T, TPageParam> =
    | { type: 'FETCH_NEXT_SUCCESS'; entity: PagedDataEntry<T, TPageParam> }
    | { type: 'FETCH_PREV_SUCCESS'; entity: PagedDataEntry<T, TPageParam> }
    | { type: 'LOADING' }
    | { type: 'SUCCESS'; entity: PagedDataEntry<T, TPageParam> }
    | { type: 'ERROR'; error: Error }
    | { type: 'RESET' };

export default function InfiniteQueryReducer<T, TPageParam>(
    state: QueryState<T, TPageParam>,
    action: QueryAction<T, TPageParam>
): QueryState<T, TPageParam> {
    switch (action.type) {
        case "FETCH_NEXT_SUCCESS": {
            const newData = {
                pages: [...state.data.pages, action.entity.page],
                pageParams: [...state.data.pageParams, action.entity.pageParam],
            };

            return {
                ...state,
                data: newData,
                status: "SUCCESS",
                error: null,
            }
        }

        case 'SUCCESS': {
            const initialData = {
                pages: [action.entity.page],
                pageParams: [action.entity.pageParam]
            }

            return {
                ...state,
                data: initialData,
                status: 'SUCCESS',
                error: null,
            };
        }

        case 'ERROR': {
            return { ...state, status: 'ERROR', error: action.error };
        }

        case 'LOADING': {
            return { ...state, status: 'LOADING' };
        }

        case 'RESET': {
            return {
                ...state,
                data: null,
                error: null,
                status: 'IDLE',
            };
        }
    }
}
