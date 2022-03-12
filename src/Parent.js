import React from 'react';
import Repositories from './Repositories';
import Milestone from './Milestones';
import Labels from './Labels';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Accordion, Alert, Badge, Form, Button, Navbar, Nav } from 'react-bootstrap';
import logo from './logo.png';

const git_api = "https://api.github.com/"
const load_repo_message = "Load Github Repositories first"

export default function Parent() {

    const [inputField, setInputField] = useState({
        username: '',
        pat: ''
    })
    const [feature, setFeature] = useState("load_repositores")
    const [repos, setRepos] = useState([]);
    const [Featurestatuslist, setFeatureStatusList] = useState([])

    let get_repos = (repos) => {
        let repositories = []
        repos.map(repo => repo['archived'] == false && repo['disabled'] == false && repositories.push(repo['name']))
        return repositories;

    }

    let load_repositores = () => {
        let repo_data = get_api(git_api + "search/repositories", 'GET')

        repo_data.then(data => {
            let repo_list = get_repos(data)
            setRepos(repo_list)

        }
        ).catch(error => {
            if (error instanceof Promise) {
                error.then(err => {
                    setRepos([])
                    alert(err)
                    return
                })
            }
            else {
                setRepos([])
                alert(error)
                return

            }
        }
        )

    }


    // For only get repos, because we are using search. It has different syntax
    let get_api = (url, method, api_data, limit = 30, page = 1) => {

        url = url.split('?')[0] + `?page=${page}&q=user:${userdata.username}+fork:true`
        let response = api(url, method, api_data, page)
        let final_response = response.then(res => {
            console.log("HI", res, page)
            if (res && Object.keys(res.items).length >= limit) {

                let inner_res = get_api(url, method, api_data, limit = 30, page + 1)
                console.log("HEY")

                let nested_respose = inner_res.then(inner => {
                    console.log("inner", inner)
                    return [...res.items, ...inner]
                }

                )
                return nested_respose
            }
            else {

                return [...res.items]
            }
        }
        )

        return final_response

    }

    // This is for list of dicts

    let get_list_api = (url, method, api_data, limit = 30, page = 1) => {

        url = url.split('?')[0] + `?page=${page}`
        let response = api(url, method, api_data, page)
        let final_response = response.then(res => {
            if (res && Object.keys(res).length == limit) {

                let inner_res = get_api(url, method, api_data, limit = 30, page + 1)

                let nested_respose = inner_res.then(inner => {

                    return [...res, ...inner]
                }

                )
                return nested_respose
            }
            else {

                return [...res]
            }
        }
        ).catch(error => { throw (error) })

        return final_response

    }

    let api = (url, method, api_data) => {
        if (method && method != 'GET') {
            if (!userdata.username && !userdata.pat) {
                alert("Error: Please enter username and personal access token")
                throw ("No Username and Personal Access Token")
            }
        }

        let response = fetch(url, {
            method: method,
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json',
                "Content-Type": "application/json",
                'Authorization': `token ${userdata.pat}`


            },
            body: JSON.stringify(api_data)
        }).then(response => {
            if (!response.ok) {
                throw response.json()
            }
            return response.json()
        })
            .then(data => {
                // console.log(data, method)
                return data
            })
            .catch(error => {
                if (error instanceof Promise) {

                    let data = error.then(err => {
                        // console.log("API ERROR", err)
                        let e = "MESSAGE: " + err['message']
                        if (err['errors'])
                            e += "Error: " + JSON.stringify(err['errors'])
                        return e
                    })
                    throw (data)

                }
                else {
                    // console.log("API_ERROR_NO_PROMISING", error)
                    throw (error)

                }

            })
        return response



    }

    const [userdata, setData] = useState({ username: '', pat: '' })
    const [visible, setVisilbility] = useState("")
    const inputsHandler = (e) => {
        setInputField({ ...inputField, [e.target.id]: e.target.value })
    }

    const submitButton = (e) => {
        setData({ ...userdata, username: inputField.username, pat: inputField.pat })

    }

    useEffect(() => {
        if (userdata && userdata.username && userdata.pat) {
            load_repositores()
        }

    }, [userdata]);

    useEffect(() => {
        setFeatureStatusList([])

    }, [feature]);

    useEffect(() => {
        if (repos && repos.length > 0) {
            alert("Repositores are loaded")
        }

    }, [repos]);

    const selectfeature = (e) => {
        setFeature(e.target.id)
    }

    return (
        <>
            <link href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css" rel="stylesheet" />
            {console.log(logo)}
            <Navbar collapseOnSelect expand="lg" variant="light" bg="light" style={{ Color: "#e87722" }}>
                <Container>
                    <Navbar.Brand > <img
                        alt=""
                        src={logo}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                    />{' '}CReF</Navbar.Brand>
                    <Navbar.Text>
                        Total Repositories: {repos.length}
                    </Navbar.Text>
                    <Nav className="me-auto">
                        <Nav.Link id="load_repositores" onClick={selectfeature} >Load Repositories</Nav.Link>
                        <Nav.Link id="read_github_repos" onClick={selectfeature} >Repositories</Nav.Link>
                        <Nav.Link id="milestone_feature" onClick={selectfeature} >Milestones</Nav.Link>
                        <Nav.Link id="label_feature" onClick={selectfeature} >Labels</Nav.Link>
                        <Nav.Link id="label_feature" href="https://github.com/paridhi-gupta1998/CrossOrgFeatures" >Github</Nav.Link>
                    </Nav>
                </Container>

            </Navbar>
            <br />
            {feature && feature === "load_repositores" ?
                <Container>
                    <h1> Load Repositories</h1>
                    <Row className="g-12" className=" align-items-end justify-content-md-center">
                        <Col md={4}>
                            <Form.Group className="mb-5">
                                <Form.Label htmlFor="disabledTextInput">User Name</Form.Label>
                                <Form.Control id="username" onChange={inputsHandler} value={inputField.username} required />
                            </Form.Group>


                            <Form.Group className="mb-5">
                                <Form.Label htmlFor="disabledTextInput">Personal Access Token</Form.Label>
                                <Form.Control type="password" id="pat" onChange={inputsHandler} value={inputField.pat} required />
                                <Form.Text type="text" target="_blank"><a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token">Click here</a> to know how to create personal access token </Form.Text>
                            </Form.Group>


                            <Form.Group className="mb-5">
                                <Button style={{ backgroundColor: "#e87722" }} onClick={submitButton}>Get Repositories</Button>
                            </Form.Group>

                        </Col>
                    </Row>
                </Container> : undefined}

            <Repositories userdata={userdata} feature={feature} repos={repos} get_api={get_api} api={api} git_api={git_api} load_repo_message={load_repo_message} />
            <Milestone userdata={userdata} feature={feature} repos={repos} get_api={get_list_api} api={api} git_api={git_api} load_repo_message={load_repo_message} Featurestatuslist={Featurestatuslist} setFeatureStatusList={setFeatureStatusList} />
            <Labels userdata={userdata} feature={feature} repos={repos} get_api={get_list_api} api={api} git_api={git_api} load_repo_message={load_repo_message} Featurestatuslist={Featurestatuslist} setFeatureStatusList={setFeatureStatusList} />




        </>
    )
}