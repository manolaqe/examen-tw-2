export const GET_JOBPOSTINGS = 'GET_JOBPOSTINGS'
export const ADD_JOBPOSTING = 'ADD_JOBPOSTING'
export const UPDATE_JOBPOSTING = 'UPDATE_JOBPOSTING'
export const DELETE_JOBPOSTING = 'DELETE_JOBPOSTING'

export function getJobPostings() {
    return {
        type: GET_JOBPOSTINGS,
        payload: async() => {
            const response = await fetch(`/jobpostings`)
            const data = response.json()
            return data
        }
    }
}

export function addJobPosting(jobPosting) {
    return {
        type: ADD_JOBPOSTING,
        payload: async() => {
            let response = await fetch(`/jobpostings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jobPosting)
            })
            response = await fetch(`/jobpostings`)
            let data = response.json()
            return data
        }
    }
}

export function updateJobPosting(jobPostingId, jobPosting) {
    return {
        type: UPDATE_JOBPOSTING,
        payload: async() => {
            await fetch(`/jobpostings/${jobPostingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jobPosting)
            })
            let response = await fetch(`/jobpostings`)
            let json = response.json()
            return json
        }
    }
}

export function deleteJobPosting(jobPostingId) {
    return {
        type: DELETE_JOBPOSTING,
        payload: async() => {
            await fetch(`/jobpostings/${jobPostingId}`, {
                method: 'DELETE'
            })
            let response = await fetch(`/jobpostings`)
            let json = response.json()
            return json
        }
    }
}