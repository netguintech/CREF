import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Accordion, Alert, Badge, Form, Button, ListGroup } from 'react-bootstrap';






function Repositories({ userdata, feature, repos, get_api, api, git_api, load_repo_message }) {


    const [label, setLabel] = useState({ color: 'fbca04' });
    const [label_method, setLabeleMethod] = useState("CREATE")
    const [color, setColor] = useState("fbca04")
    return (
        <>

            <Row className="g-12" className="justify-content-md-center">
                <Col md={4}>
                    {feature && feature === "read_github_repos" ?
                        <>
                            {repos && repos.length > 0 ?
                                <ListGroup>
                                    {repos.map(repo => <ListGroup.Item key={repo}>{repo}</ListGroup.Item>
                                    )}
                                </ListGroup> : <p style={{ color: "red" }}>{load_repo_message}</p>}
                        </>
                        : undefined
                    }

                </Col>

            </Row>

        </>
    );

}
export default Repositories;