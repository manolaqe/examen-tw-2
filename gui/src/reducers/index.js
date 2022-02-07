import { combineReducers } from 'redux'

import jobposting from './jobposting-reducer'
import candidate from './candidate-reducer'

export default combineReducers({
    jobposting,
    candidate
})