import {
  DatasetDetailActions,
  DatasetDetailActionsType,
  DatasetDetailChangePayload,
  DatasetDetailMountPayload,
  DatasetFetchPayload,
  DatasetFetchPayloadFailed,
  DatasetFetchPayloadSuccess,
  QualityFetchPayload,
  QualityFetchPayloadFailed,
  QualityFetchPayloadSuccess,
  FetchDescendantsPayload,
} from "./dataset-detail-actions";
import {
  DatasetListActions,
  DatasetListActionsType,
  DatasetsFetchPayloadSuccess,
  DatasetsFetchPayloadFailed,
} from "../dataset-list/dataset-list-actions";
import {
  DataService,
  Dataset,
  Distribution,
  QualityMeasures,
} from "./dataset-detail-model";
import {
  DatasetListItem,
} from "../dataset-list/dataset-list-model";
import {getType} from "typesafe-actions";
import {DatasetListQuery} from "../api/api-interface";
import {Status} from "../app/resource-status";
export {Status} from "../app/resource-status";

export interface ResourceStatus {
  iri?: string;
  status: Status;
  error?: Error;
}

export interface Descendants {
  count?:number;
  datasets: DatasetListItem[];
  status: Status;
}

interface State {
  active: boolean;
  /**
   * Current main dataset.
   */
  dataset: (Dataset & ResourceStatus) | ResourceStatus;
  /**
   * Other datasets in the hierarchy.
   */
  descendants: Descendants;
  /**
   * Query used for descendants, so we react only on data we need.
   */
  descendantsQuery?: DatasetListQuery;
  /**
   * Distributions or data services.
   */
  parts: Record<string,
    (Distribution & ResourceStatus) |
    (DataService & ResourceStatus) |
    ResourceStatus>;
  /**
   * Quality records for all data.
   */
  quality: Record<string, (QualityMeasures & ResourceStatus) | ResourceStatus>;
}

const initialStatus: State = {
  "active": false,
  "dataset": {
    "status": Status.Undefined,
  },
  "descendants": {
    "datasets": [],
    "status": Status.Undefined,
  },
  "descendantsQuery": undefined,
  "parts": {},
  "quality": {},
};

type Actions = DatasetDetailActionsType | DatasetListActionsType;

function reducer(state = initialStatus, action: Actions) {
  switch (action.type) {
    case getType(DatasetDetailActions.mountDatasetDetail):
      return onDatasetMount(state, action.payload);
    default:
      break;
  }
  if (!state.active) {
    return state;
  }
  switch (action.type) {
    case getType(DatasetDetailActions.unMountDatasetDetail):
      return onDatasetUnMount();
    case getType(DatasetDetailActions.changeDatasetDetail):
      return onDatasetChange(state, action.payload);
    case getType(DatasetDetailActions.fetchDataset.request):
      return onFetchDataset(state, action.payload);
    case getType(DatasetDetailActions.fetchDataset.success):
      return onFetchDatasetSuccess(state, action.payload);
    case getType(DatasetDetailActions.fetchDataset.failure):
      return onFetchDatasetFailed(state, action.payload);
    case getType(DatasetDetailActions.fetchQuality.request):
      return onFetchQuality(state, action.payload);
    case getType(DatasetDetailActions.fetchQuality.success):
      return onFetchQualitySuccess(state, action.payload);
    case getType(DatasetDetailActions.fetchQuality.failure):
      return onFetchQualityFailed(state, action.payload);
    case getType(DatasetDetailActions.setDescendantsQuery):
      return onSetDescendantsQuery(state, action.payload);
    case getType(DatasetListActions.fetchDatasets.success):
      return onFetchDescendantsSuccess(state, action.payload);
    case getType(DatasetListActions.fetchDatasets.failure):
      return onFetchDescendantsFailed(state, action.payload);
    default:
      return state;
  }
}

function onDatasetMount(
  state: State, action: DatasetDetailMountPayload): State {
  return {
    ...state,
    "active": true,
    "dataset": createEmptyResourceStatus(action.dataset),
  };
}

function createEmptyResourceStatus(iri: string): ResourceStatus {
  return {
    "iri": iri,
    "status": Status.Undefined,
  };
}

function onDatasetUnMount(): State {
  return initialStatus;
}

function onDatasetChange(
  state: State, action: DatasetDetailChangePayload): State {
  return {
    ...state,
    "dataset": createEmptyResourceStatus(action.dataset),
    "descendantsQuery": undefined,
    "descendants": {
      "datasets": [],
      "status": Status.Undefined,
    },
  };
}

function onFetchDataset(state: State, action: DatasetFetchPayload): State {
  if (state.dataset.iri !== action.dataset) {
    return state;
  }
  return {
    ...state,
    "dataset": createLoadingResourceStatus(state.dataset.iri),
  };
}

function createLoadingResourceStatus(iri: string): ResourceStatus {
  return {
    "iri": iri,
    "status": Status.Loading,
  };
}

function onFetchDatasetSuccess(
  state: State, action: DatasetFetchPayloadSuccess): State {
  if (state.dataset.iri !== action.dataset) {
    return state;
  }
  return {
    ...state,
    "dataset": wrapReadyResourceStatus(action.payload),
  };
}

function wrapReadyResourceStatus<T>(data: T): ResourceStatus & T {
  return {
    ...data,
    "status": Status.Ready,
  };
}

function onFetchDatasetFailed(
  state: State, action: DatasetFetchPayloadFailed): State {
  if (state.dataset.iri !== action.dataset) {
    return state;
  }
  return {
    ...state,
    "dataset": createFailedResourceStatus(state.dataset.iri, action.error),
  };
}

function createFailedResourceStatus(iri: string, error: Error): ResourceStatus {
  return {
    "iri": iri,
    "status": Status.Failed,
    "error": error,
  };
}

function onFetchQuality(state: State, action: QualityFetchPayload): State {
  return {
    ...state,
    "quality": {
      ...state.quality,
      [action.iri]: createLoadingResourceStatus(action.iri),
    },
  };
}

function onFetchQualitySuccess(
  state: State, action: QualityFetchPayloadSuccess): State {
  return {
    ...state,
    "quality": {
      ...state.quality,
      [action.iri]: wrapReadyResourceStatus(action.payload),
    },
  };
}

function onFetchQualityFailed(
  state: State, action: QualityFetchPayloadFailed): State {
  return {
    ...state,
    "quality": {
      ...state.quality,
      [action.iri]: createFailedResourceStatus(action.iri, action.error),
    },
  };
}

function onSetDescendantsQuery(
  state: State, action: FetchDescendantsPayload): State {
  if (state.descendants.status === Status.Ready) {
    return {
      ...state,
      "descendantsQuery": action.query,
      "descendants": {
        ...state.descendants,
        "status": Status.Updating,
      },
    };
  }
  return {
    ...state,
    "descendantsQuery": action.query,
    "descendants": {
      "datasets": [],
      "status": Status.Loading,
    },
  };
}

function onFetchDescendantsSuccess(
  state: State, action: DatasetsFetchPayloadSuccess): State {
  if (action.query !== state.descendantsQuery) {
    return state;
  }
  return {
    ...state,
    "descendants": {
      "count": action.payload.datasetsCount,
      "datasets": action.payload.datasets,
      "status": Status.Ready,
    },
  };
}

function onFetchDescendantsFailed(
  state: State, action: DatasetsFetchPayloadFailed): State {
  if (action.query !== state.descendantsQuery) {
    return state;
  }
  return {
    ...state,
    "descendants": {
      "datasets": [],
      "status": Status.Failed,
    },
  };
}

const reducerName = "dataset-detail";

export default {
  "name": reducerName,
  "reducer": reducer,
};

const stateSelector = (state: any): State => state[reducerName];

const undefinedResource: ResourceStatus = {
  "status": Status.Undefined,
};

export const datasetSelector =
  (state: any): (Dataset & ResourceStatus) | ResourceStatus =>
    stateSelector(state).dataset;

export const qualitySelector =
  (state: any, iri: string):
    (QualityMeasures & ResourceStatus) | ResourceStatus =>
    stateSelector(state).quality[iri] || undefinedResource;

export const descendantsSelector =
  (state: any): Descendants => stateSelector(state).descendants;
