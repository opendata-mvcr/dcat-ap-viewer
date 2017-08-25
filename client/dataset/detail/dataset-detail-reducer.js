import {
    FETCH_DATASET_REQUEST,
    FETCH_DATASET_SUCCESS,
    FETCH_DATASET_FAILED,
    FETCH_DISTRIBUTION_REQUEST,
    FETCH_DISTRIBUTION_SUCCESS,
    FETCH_DISTRIBUTION_FAILED,
    SET_DISTRIBUTION_PAGE_INDEX
} from "./dataset-detail-actions";
import {
    STATUS_INITIAL,
    STATUS_FETCHING,
    STATUS_FETCHED,
    STATUS_FAILED
} from "./../../services/http-request";

const initialState = {
    "ui": {
        "distributionsPageIndex": 0
    },
    "dataset": {
        "status": STATUS_INITIAL
    },
    "distributions": {}
};

export const datasetDetailReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_DATASET_REQUEST:
            return {
                ...state,
                "dataset": {
                    "@id": action.iri,
                    "status": STATUS_FETCHING
                }
            };
        case FETCH_DATASET_SUCCESS:
            return {
                ...state,
                "dataset": {
                    ...action.data,
                    "status": STATUS_FETCHED
                }
            };
        case FETCH_DATASET_FAILED:
            return {
                ...state,
                "dataset": {
                    ...action.data,
                    "status": STATUS_FAILED
                }
            };
        case FETCH_DISTRIBUTION_REQUEST:
            return {
                ...state,
                "distributions": copyAndAdd(state.distributions, action.iri, {
                    ...action.data,
                    "status": STATUS_FETCHING
                })
            };
            return state;
        case FETCH_DISTRIBUTION_SUCCESS:
            if (action.data === undefined) {
                return {
                    ...state,
                    "distributions": copyAndAdd(state.distributions, action.iri,
                        {
                            "status": STATUS_FAILED
                        })
                };
            } else {
                return {
                    ...state,
                    "distributions": copyAndAdd(state.distributions, action.iri,
                        {
                            ...action.data,
                            "status": STATUS_FETCHED
                        })
                };
            }
        case FETCH_DISTRIBUTION_FAILED:
            return {
                ...state,
                "distributions": copyAndAdd(state.distributions, action.iri,
                    {
                        "status": STATUS_FAILED
                    })
            };
        case SET_DISTRIBUTION_PAGE_INDEX:
            return {
                ...state,
                "ui": {
                    ...state.ui,
                    "distributionsPageIndex": action.page
                }
            }
        default:
            return state
    }
};

function copyAndAdd(dictionary, key, item) {
    const copy = {...dictionary};
    copy[key] = item;
    return copy;
}