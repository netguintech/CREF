import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Accordion, Alert, Badge, Form, Button, ListGroup, Table } from 'react-bootstrap';

let error_list = []

function Milestone({ userdata, feature, repos, get_api, api, git_api, load_repo_message, Featurestatuslist, setFeatureStatusList }) {
    const [milestone, setMilestone] = useState({});
    const [milestone_method, setMileStoneMethod] = useState("CREATE")


    let get_milestone_number = (milestones_list, name) => {
        let num = false
        for (let ml of milestones_list) {
            if (ml['title'] == name) {
                return ml['number']
            }
        }
        return false

    }
    let update_milestone = (milestone_url, name) => {
        let milestone_list = get_api(git_api + milestone_url, 'GET')
        let update_response = milestone_list.then(list => {
            let ml_number = get_milestone_number(list, name)
            if (ml_number) {
                milestone_url = milestone_url + `/${ml_number}`
                let temp_milestone = milestone
                if (milestone['rename']) {
                    temp_milestone['title'] = milestone['rename']
                    delete temp_milestone['rename']
                }
                api(git_api + milestone_url, 'PATCH', temp_milestone)
            }
        }
        )
        return update_response
    }
    let create_milestone = (milestone_url) => {
        let create_response = api(git_api + milestone_url, 'POST', milestone)
        return create_response
    }

    let delete_milestone = (milestone_url, name) => {
        let milestone_list = get_api(git_api + milestone_url, 'GET')
        let delete_response = milestone_list.then(list => {
            let ml_number = get_milestone_number(list, name)
            if (ml_number) {
                milestone_url = milestone_url + `/${ml_number}`
                api(git_api + milestone_url, 'DELETE')
            }

        })
        return delete_response
    }

    const handleSubmitMilestone = (evt) => {

        error_list = []
        evt.preventDefault();
        let crud_response = function CUDRepos() {
            return new Promise((resolve, reject) => {
                Promise.all(repos.map(repo => {

                    let response = ""
                    let milestone_url = "repos/" + userdata.username + "/" + repo + "/milestones"
                    if (milestone_method == "CREATE") {
                        response = create_milestone(milestone_url)
                    }
                    else if (milestone_method == "UPDATE") {
                        response = update_milestone(milestone_url, milestone['title'])
                    }
                    else if (milestone_method == "DELETE") {
                        response = delete_milestone(milestone_url, milestone['title'])
                    }

                    let return_response = response.then(res => {
                        error_list.push({ repo_name: repo, status: 0, message: 'Success' })
                        return

                    }).catch(error => {
                        if (error instanceof Promise) {
                            error.then(err => {

                                error_list.push({ repo_name: repo, status: 1, message: err })
                                return

                            })
                        }
                        else {

                            error_list.push({ repo_name: repo, status: 1, message: error })
                            return

                        }

                    })
                    return return_response
                })
                ).then(r => resolve("RESOLVED"))
            })
        }
        crud_response().then((res) => {
            setFeatureStatusList(error_list)
            console.log("CUD", res, error_list)

        })



    }

    const handleMilestoneInputs = (type, value) => {

        if (value) {
            let temp_milestone = milestone
            if (type == 'due_on')
                value += "T00:00:00Z"
            temp_milestone[type] = value
            setMilestone({ ...temp_milestone })
        }
        else {
            let temp_milestone = milestone
            delete temp_milestone[type]
            setMilestone({ ...temp_milestone })
        }
    }
    return (
        
            <>
            {feature && feature === "milestone_feature" ?
                <>
                    {repos && repos.length > 0 ?
                        <Row className="g-12" className="justify-content-md-center">
                        <Col md={4}>
                            <Container>
                                <h1> Milestones </h1>
                                <Form onSubmit={handleSubmitMilestone} >
                                    <fieldset>
                                        <Form.Group className="mb-5">
                                            <Form.Label htmlFor="disabledTextInput">Name</Form.Label>
                                            <Form.Control id="milestone-name" onChange={e => handleMilestoneInputs('title', e.target.value)} required />
                                        </Form.Group>
                                        <Form.Group className="mb-5">
                                            <Form.Label htmlFor="disabledTextInput">Description</Form.Label>
                                            <Form.Control as="textarea" id="milestone-description" rows={3} onChange={e => handleMilestoneInputs('description', e.target.value)} />
                                        </Form.Group>
                                        <Form.Group className="mb-5">
                                            <Form.Label htmlFor="disabledTextInput">Due Date</Form.Label>
                                            <Form.Control type="date" name='date_of_birth' onChange={e => handleMilestoneInputs('due_on', e.target.value)} />
                                            {/* <Form.Control id="milestone-due" onChange={e => setMilestone({ ...milestone, "due_date": e.target.value })} /> */}
                                        </Form.Group>
                                        <Form.Group className="mb-5">
                                            <Form.Label htmlFor="disabledSelect">Operation: </Form.Label>
                                            <Form.Select id="milestoneMethod" onChange={e => setMileStoneMethod(e.target.value)} >
                                                <option>CREATE</option>
                                                <option>UPDATE</option>
                                                <option>DELETE</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="mb-5">
                                            <Form.Label htmlFor="disabledTextInput">Rename</Form.Label>
                                            <Form.Control id="milestone-rename" onChange={e => handleMilestoneInputs('rename', e.target.value)} />
                                            <Form.Text className="text-muted">
                                                Fill this when you want to update the name
                                            </Form.Text>
                                        </Form.Group>
                                        <Button style={{ backgroundColor: "#e87722" }} type="submit">Submit</Button>
                                    </fieldset>
                                </Form>
                               </Container>
                               </Col>
                               <br/>
                                {Featurestatuslist && Featurestatuslist.length > 0 &&
                                <Col md={6}>

                                    < Table responsive="sm">
                                        <thead>
                                            <tr>
                                                <th>REPO</th>
                                                <th>STATUS</th>
                                                <th>MESSAGE</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Featurestatuslist.map(error => {
                                                return <tr>
                                                    <td>{error.repo_name}</td>
                                                    <td>{error.status === 0 ? <span role="img" aria-label="sheep">✅</span> : <span role="img" aria-label="sheep">❌</span> }</td>
                                                    <td>{error.message}</td>
                                                </tr>
                                            })}

                                        </tbody>
                                    </Table>
                                    </Col>


                                }
                        </Row> : <p style={{ color: "red" }}>{load_repo_message}</p>}
                </> : undefined
                    }
                </>
    )
}
            export default Milestone;