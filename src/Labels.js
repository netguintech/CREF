

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Accordion, Alert, Badge, Form, Button, ListGroup, Table } from 'react-bootstrap';

let error_list = []
function Labels({ userdata, feature, repos, get_api, api, git_api, load_repo_message, Featurestatuslist, setFeatureStatusList }) {

    const [label, setLabel] = useState({ color: 'fbca04' });
    const [label_method, setLabeleMethod] = useState("CREATE")
    const [color, setColor] = useState("fbca04")


    let get_label_number = (labels_list, name) => {
        for (let ll of labels_list) {
            if (ll['name'] == name) {
                return ll['url']
            }
        }
        return false

    }
    let update_label = (label_url, name) => {
        let label_list = api(git_api + label_url, 'GET')
        let update_respose = label_list.then(list => {
            let ll_url = get_label_number(list, name)
            if (ll_url) {
                let temp_label = label
                if (label['rename']) {
                    temp_label['name'] = temp_label['rename']
                    delete temp_label['rename']
                }
                api(ll_url, 'PATCH', temp_label)
            }
        }
        )
        return update_respose
    }


    let create_label = (label_url) => {
        let create_response = api(git_api + label_url, 'POST', label)

        return create_response
    }

    let delete_label = (label_url, name) => {
        let label_list = api(git_api + label_url, 'GET')

        let delete_response = label_list.then(list => {
            let ll_url = get_label_number(list, name)
            if (ll_url) {
                api(ll_url, 'DELETE')
            }

        })
        return delete_response
    }

    let color_generator = () => {
        let temp = Math.floor(Math.random() * 16777215).toString(16);
        setColor(temp);
        handleLabelInputs('color', temp)

    }

    const handleSubmitLabel = (evt) => {

        error_list = []
        evt.preventDefault();

        let crud_response = function CUDRepos() {
            return new Promise((resolve, reject) => {
                Promise.all(repos.map(repo => {
                    let response = ""
                    let label_url = "repos/" + userdata.username + "/" + repo + "/labels"
                    if (label_method == "CREATE") {
                        response = create_label(label_url)
                    }

                    else if (label_method == "UPDATE") {
                        response = update_label(label_url, label['name'])
                    }
                    else if (label_method == "DELETE") {
                        response = delete_label(label_url, label['name'])
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

                ).then(see => resolve("RESOLVED"))
            })
        }

        crud_response().then((res) => {
            setFeatureStatusList(error_list)
            console.log("CUD", res, error_list)

        })

    }

    const handleLabelInputs = (type, value) => {
        if (value) {
            let temp_label = label
            temp_label[type] = value
            setLabel({ ...temp_label })
        }
        else {
            let temp_label = label
            delete temp_label[type]
            setLabel({ ...temp_label })
        }
    }


    return (
        <>
            {feature && feature === "label_feature" ?
                <>
                    {repos && repos.length > 0 ?
                        <Row className="g-12" className="justify-content-md-center">
                            <Col md={4}>
                                <Container>
                                    <h1> Labels</h1>
                                    <Form onSubmit={handleSubmitLabel}>
                                        <fieldset>
                                            <Form.Group className="mb-5">
                                                <Form.Label htmlFor="disabledTextInput">Name</Form.Label>
                                                <Form.Control id="label-name" onChange={e => handleLabelInputs('name', e.target.value)} required />
                                            </Form.Group>
                                            <Form.Group className="mb-5">
                                                <Form.Label htmlFor="disabledTextInput">Description</Form.Label>
                                                <Form.Control as="textarea" id="label-description" rows={3} onChange={e => handleLabelInputs('description', e.target.value)} />
                                            </Form.Group>
                                            <Form.Group className="mb-5">
                                                <Form.Label htmlFor="disabledTextInput">Color</Form.Label>
                                                <Row>
                                                    <Col md={4}>
                                                        <Form.Control id="color" value={label.color} onChange={e => handleLabelInputs('color', e.target.value)} />
                                                    </Col>
                                                    <Col md={4}>
                                                        <p style={{ backgroundColor: '#' + color }}>{color}</p>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Button onClick={() => color_generator()}>Next color</Button>
                                                    </Col>
                                                </Row>


                                            </Form.Group>
                                            <Form.Group className="mb-5">
                                                <Form.Label htmlFor="disabledSelect">Operation: </Form.Label>
                                                <Form.Select id="labelMethod" onChange={e => setLabeleMethod(e.target.value)} >
                                                    <option>CREATE</option>
                                                    <option>UPDATE</option>
                                                    <option>DELETE</option>
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group className="mb-5">
                                                <Form.Label htmlFor="disabledTextInput">Rename</Form.Label>
                                                <Form.Control id="label-rename" onChange={e => handleLabelInputs('rename', e.target.value)} />
                                                <Form.Text className="text-muted">
                                                    Fill this when you want to update the name
                                                </Form.Text>
                                            </Form.Group>
                                            <Button style={{ backgroundColor: "#e87722" }} type="submit">Submit</Button>
                                        </fieldset>
                                    </Form>

                                </Container>
                            </Col>
                            <br />

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
                                            <td>{error.status === 0 ? <span role="img" aria-label="tick">✅</span> : <span role="img" aria-label="cross">❌</span> }</td>
                                            <td>{error.message}</td>
                                        </tr>
                                    })}

                                </tbody>
                            </Table>
                                </Col>


                            }

                </Row> : <p style={{ color: "red" }} >{load_repo_message}</p>}
        </> : undefined
}

        </ >
    );
}
export default Labels;