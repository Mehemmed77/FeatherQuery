import { PagedDataEntries, PagedDataEntry } from '../types/infiniteQuery';
import { STATUS } from '../types/status';

export interface QueryState<T> {
    data: PagedDataEntries<T> | null;
    status: STATUS;
    error: Error | null;
}

export type QueryAction<T> =
    | { type: 'REFETCH_START'; staleEntity: PagedDataEntry<T> }
    | { type: 'REFETCH_END'; entity: PagedDataEntry<T> }
    | { type: 'FETCH_PREV'; entity: PagedDataEntry<T> }
    | { type: 'LOADING' }
    | { type: 'SUCCESS'; entity: PagedDataEntry<T> }
    | { type: 'ERROR'; error: Error }
    | { type: 'RESET' };

export default function InfiniteQueryReducer<T>(
    state: QueryState<T>,
    action: QueryAction<T>
): QueryState<T> {
    switch (action.type) {
        case 'REFETCH_START': {
            return {
                ...state,
                status: 'FETCHING',
                error: null,
            };
        }

        case 'REFETCH_END': {
            const entity = action.entity;

            return {
                data: {
                    pages: state.data.pages.map((p, idx) =>
                        state.data.pageParams[idx] === entity.pageParam ? entity.page : p
                    ),
                    pageParams: state.data.pageParams,
                },
                status: 'SUCCESS',
                error: null,
            };
        }

        case 'SUCCESS': {
            const newData = {
                pages: [...state.data.pages, action.entity.page],
                pageParams: [...state.data.pageParams, action.entity.pageParam],
            };

            return {
                data: newData,
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
                data: { pages: [], pageParams: [] },
                error: null,
                status: 'IDLE',
            };
        }
    }
}
