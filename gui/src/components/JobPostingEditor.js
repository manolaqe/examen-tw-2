import { useEffect, useState, useRef } from 'react'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'
import { jobPostingActions, candidateActions } from '../actions'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Dialog } from 'primereact/dialog'
import { Calendar } from 'primereact/calendar'

const jobPostingListSelector = state => state.jobposting.jobPostingList
const candidateListSelector = state => state.candidate.candidateList

function JobPostingEditor() {
    //jobposting
    const [isDialogShown, setIsDialogShown] = useState(false)
    const [isNewJobPosting, setIsNewJobPosting] = useState(true)
    const [selected, setSelected] = useState(null)
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState(new Date())
    const dt = useRef(null);
    const jobPostingList = useSelector(jobPostingListSelector, shallowEqual)

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(jobPostingActions.getJobPostings())
    }, [dispatch])

    const addNew = () => {
        setIsDialogShown(true)
        setDescription('')
        setDeadline(new Date())
        setSelected(null)
        setIsNewJobPosting(true)
    }

    const saveJobPosting = () => {
        if (isNewJobPosting) {
            dispatch(jobPostingActions.addJobPosting({ description, deadline }))
        } else {
            dispatch(jobPostingActions.updateJobPosting(selected, { description, deadline }))
        }

        setIsDialogShown(false)
        setDescription('')
        setDeadline(new Date())
        setSelected(null)
    }

    const deleteJobPosting = (rowData) => {
        dispatch(jobPostingActions.deleteJobPosting(rowData.id))
    }

    const editJobPosting = (rowData) => {
        setSelected(rowData.id)
        setDescription(rowData.description)
        setDeadline(rowData.deadline)
        setIsDialogShown(true)
        setIsNewJobPosting(false)
    }

    const hideDialog = () => {
        setIsDialogShown(false)
    }

    const exportCSV = (selectionOnly) => {
        dt.current.exportCSV({ selectionOnly });
    }

    const tableHeader = (
        <div>
            <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" data-pr-tooltip="CSV" />
        </div>
    )

    const tableFooter = (
        <div>
            <Button label='Add' icon='pi pi-plus' onClick={addNew} />
        </div>
    )

    const addDialogFooter = (
        <div>
            <Button label='Save' icon='pi pi-save' onClick={saveJobPosting} />
        </div>
    )

    const opsColumn = (rowData) => {
        return (
            <>
                <Button icon='pi pi-times' className='p-button-danger' onClick={() => deleteJobPosting(rowData)} />
                <br></br>
                <Button icon='pi pi-pencil' className='p-button-warning' onClick={() => editJobPosting(rowData)} />
                <br></br>
                <Button
                    icon='pi 
                    pi-align-justify'
                    className='p-button-info'
                    onClick={() => candidateJobPosting(rowData)}
                />
            </>
        )
    }
    //jobposting

    //candidate
    const [name, setName] = useState('')
    const [cv, setCV] = useState('')
    const [email, setEmail] = useState('')
    const [isNewCandidate, setIsNewCandidate] = useState(true)
    const [selectedCandidate, setSelectedCandidate] = useState(null)
    const [isCandidateDialogShown, setIsCandidateDialogShown] = useState(false)
    const [isCandidateShown, setIsCandidateShown] = useState(false)
    const [jobPostingId, setJobPostingId] = useState(null)

    const candidateList = useSelector(candidateListSelector, shallowEqual)

    const addNewCandidate = () => {
        setIsCandidateDialogShown(true)
        setName('')
        setCV('')
        setEmail('')
        setSelectedCandidate(null)
        setIsNewCandidate(true)
    }

    const hideCandidateDialog = () => {
        setIsCandidateDialogShown(false)
        setIsCandidateShown(false)
    }

    const saveCandidate = () => {
        if (isNewCandidate) {
            dispatch(
                candidateActions.addCandidate(jobPostingId, {
                    name,
                    cv,
                    email,
                })
            )
        } else {
            dispatch(
                candidateActions.updateCandidate(jobPostingId, selectedCandidate, {
                    name,
                    cv,
                    email,
                })
            )
        }
        setName('')
        setCV('')
        setEmail('')
        setSelectedCandidate(null)
        setIsCandidateDialogShown(false)
    }

    const addCandidateDialogFooter = (
        <div>
            <Button label='Save' icon='pi pi-save' onClick={saveCandidate} />
        </div>
    )

    const candidateTableFooter = (
        <div>
            <Button label='Add' icon='pi pi-plus' onClick={addNewCandidate} />
        </div>
    )

    const opsCandidateColumn = (rowData) => {
        return (
            <>
                <Button
                    icon='pi pi-times'
                    className='p-button-danger'
                    onClick={() => deleteCandidate(rowData)}
                />
                <Button
                    icon='pi pi-pencil'
                    className='p-button-warning'
                    onClick={() => updateCandidate(rowData)}
                />
            </>
        )
    }
    const deleteCandidate = (rowData) => {
        dispatch(candidateActions.deleteCandidate(jobPostingId, rowData.id))
    }

    const updateCandidate = (rowData) => {
        setSelectedCandidate(rowData.id)
        setName(rowData.name)
        setCV(rowData.cv)
        setEmail(rowData.email)
        setIsNewCandidate(false)
        setIsCandidateDialogShown(true)
    }

    const candidateJobPosting = (rowData) => {
        setIsCandidateShown(true)
        dispatch(candidateActions.getCandidates(rowData.id))
        setJobPostingId(rowData.id)
    }


    //candidate

    return (
        <div >

            <DataTable ref={dt} value={jobPostingList} footer={tableFooter} header={tableHeader} selectionMode="multiple">
                <Column header='Description' field='description' sortable/>
                <Column header='Deadline' field='deadline' sortable/>
                <Column body={opsColumn} />
            </DataTable>
            {
                isDialogShown
                    ? (
                        <Dialog visible={isDialogShown} onHide={hideDialog} footer={addDialogFooter} header='A job posting'>
                            <InputText onChange={(evt) => setDescription(evt.target.value)} value={description} name='description' placeholder='description' />
                            <Calendar
                                onChange={(evt) => setDeadline(evt.target.value)}
                                value={deadline}
                                name='deadline'
                                placeholder='deadline'
                            />
                        </Dialog>
                    ) : null
            }

            {
                isCandidateShown ? (
                    <Dialog
                        visible={isCandidateShown}
                        onHide={hideCandidateDialog}
                        header='Candidates'
                    >
                        <DataTable value={candidateList} footer={candidateTableFooter}>
                            <Column header='Name' field='name' sortable />
                            <Column header='CV' field='cv' sortable />
                            <Column header='Email' field='email' />
                            <Column body={opsCandidateColumn} />
                        </DataTable>
                    </Dialog>
                ) : null
            }

            {
                isCandidateDialogShown ? (
                    <Dialog
                        visible={isCandidateDialogShown}
                        onHide={hideCandidateDialog}
                        footer={addCandidateDialogFooter}
                        header='Candidate'
                    >
                        <InputText
                            onChange={(evt) => setName(evt.target.value)}
                            value={name}
                            name='name'
                            placeholder='name'
                        />
                        
                        <InputText
                            onChange={(evt) => setCV(evt.target.value)}
                            value={cv}
                            name='cv'
                            placeholder='cv'
                        />
                        <InputText
                            onChange={(evt) => setEmail(evt.target.value)}
                            value={email}
                            name='email'
                            placeholder='email'
                        />
                    </Dialog>
                ) : null
          }
        </div>
    )
}

export default JobPostingEditor
