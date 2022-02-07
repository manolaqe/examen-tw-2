export const GET_CANDIDATES = 'GET_CANDIDATES'
export const ADD_CANDIDATE = 'ADD_CANDIDATE'
export const UPDATE_CANDIDATE = 'UPDATE_CANDIDATE'
export const DELETE_CANDIDATE = 'DELETE_CANDIDATE'

export function getCandidates(jobPostingId) {
    return {
        type: GET_CANDIDATES,
        payload: async() => {
            const response = await fetch(`/jobpostings/${jobPostingId}/candidates`)
            const data = response.json()
            return data
        }
    }
}

export function addCandidate(jobPostingId, candidate) {
    return {
        type: ADD_CANDIDATE,
        payload: async() => {
            let response = await fetch(`/jobpostings/${jobPostingId}/candidates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(candidate)
            })
            response = await fetch(`/jobpostings/${jobPostingId}/candidates`)
            let data = response.json()
            return data
        }
    }
}

export function updateCandidate(jobPostingId, candidateId, candidate) {
    return {
        type: UPDATE_CANDIDATE,
        payload: async() => {
            await fetch(`/jobpostings/${jobPostingId}/candidates/${candidateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(candidate)
            })
            let response = await fetch(`/jobpostings/${jobPostingId}/candidates`)
            let json = response.json()
            return json
        }
    }
}

export function deleteCandidate(jobPostingId, candidateId) {
    return {
        type: DELETE_CANDIDATE,
        payload: async() => {
            await fetch(`/jobpostings/${jobPostingId}/candidates/${candidateId}`, {
                method: 'DELETE'
            })
            let response = await fetch(`/jobpostings/${jobPostingId}/candidates`)
            let json = response.json()
            return json
        }
    }
}