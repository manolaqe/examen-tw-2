const INITIAL_STATE = {
    jobPostingList: [],
    error: null,
    fetching: false,
    fetched: false
}

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'GET_JOBPOSTINGS_PENDING':
        case 'ADD_JOBPOSTING_PENDING':
        case 'UPDATE_JOBPOSTING_PENDING':
        case 'DELETE_JOBPOSTING_PENDING':
            return {...state, error: null, fetching: true, fetched: false }
        case 'GET_JOBPOSTINGS_FULFILLED':
        case 'ADD_JOBPOSTING_FULFILLED':
        case 'UPDATE_JOBPOSTING_FULFILLED':
        case 'DELETE_JOBPOSTING_FULFILLED':
            return {...state, jobPostingList: action.payload.records, fetching: false, fetched: true }
        case 'GET_JOBPOSTINGS_REJECTED':
        case 'ADD_JOBPOSTING_REJECTED':
        case 'UPDATE_JOBPOSTING_REJECTED':
        case 'DELETE_JOBPOSTING_REJECTED':
            return {...state, error: action.payload.records, fetching: false, fetched: false }
        default:
            return state
    }
}