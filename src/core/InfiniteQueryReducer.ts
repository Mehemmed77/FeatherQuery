import { PagedDataEntries, PagedDataEntry } from '../types/infiniteQuery';
import { STATUS } from '../types/status';

export interface QueryState<T, TPageParam> {
    data: PagedDataEntries<T, TPageParam> | null;
    status: STATUS;
    error: Error | null;
}

export type QueryAction<T, TPageParam> =
    | { type: 'REFETCH_START'; staleEntity: PagedDataEntry<T, TPageParam> }
    | { type: 'REFETCH_END'; entity: PagedDataEntry<T, TPageParam> }
    | { type: 'FETCH_PREV'; entity: PagedDataEntry<T, TPageParam> }
    | { type: 'LOADING' }
    | { type: 'SUCCESS'; entity: PagedDataEntry<T, TPageParam> }
    | { type: 'ERROR'; error: Error }
    | { type: 'RESET' };

export default function InfiniteQueryReducer<T, TPageParam>(
    state: QueryState<T, TPageParam>,
    action: QueryAction<T, TPageParam>
): QueryState<T, TPageParam> {
    switch (action.type) {
        case 'REFETCH_START': {
            const newData = {
                pages: [...state.data.pages, action.staleEntity.page],
                pageParams: [
                    ...state.data.pageParams,
                    action.staleEntity.pageParam,
                ],
            };

            return {
                data: newData,
                status: 'FETCHING',
                error: null,
            };
        }

        case 'REFETCH_END': {
            const entity = action.entity;

            const prevData = state.data.pages;

            return {
                data: {
                    pages: [
                        ...prevData.slice(prevData.length - 1),
                        entity.page,
                    ],
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
                data: null,
                error: null,
                status: 'IDLE',
            };
        }
    }
}
