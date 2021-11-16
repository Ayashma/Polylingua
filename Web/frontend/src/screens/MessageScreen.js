import React, { useEffect, useState, useRef } from 'react'
import { Row, Col, Card, Container, Form, Button } from 'react-bootstrap'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUser } from '@fortawesome/free-solid-svg-icons';
// import { messagesListByConversation, conversationsListByUser } from '../actions/messageActions';
// import Loader from "../components/Loader";
// import Message from "../components/Message";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import ChatMessage from '../components/ChatMessage';
import { io } from 'socket.io-client'

const MessageScreen = ({ history }) => {
    const dispatch = useDispatch();

    const [conversations, setConversations] = useState([]);

    const [currentConversation, setCurrentConversation] = useState(null);

    const [messages, setMessages] = useState([]);

    const [newMessage, setNewMessage] = useState('');
    const [arrivedMessage, setArrivedMessage] = useState(null);

    const [friend, setFriend] = useState([]);

    const socket = useRef();

    const scrollRef = useRef();

    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;

    const config = {
        headers: {
            Authorization: `Bearer ${userInfo.token}`
        }
    }

    useEffect(() => {
        if (userInfo) {
            socket.current = io("ws:localhost:8900");
            socket.current.on("getMessage", data => {
                setArrivedMessage({
                    sender: data.sender,
                    contents: data.contents,
                    date: Date.now(),
                })
            })
        } else {
            history.push('/login');
        }
    }, [userInfo, history])

    useEffect(() => {
        arrivedMessage && currentConversation?.arrivalMessage.sender &&
            setMessages(prev => [...prev, arrivedMessage])

    }, [arrivedMessage, currentConversation])

    useEffect(() => {
        if (userInfo) {
            socket.current.emit("addUser", userInfo._id);
            socket.current.on("getUsers", users => {
                console.log(users);
            });
        } else {
            history.push('/login');
        }
    }, [userInfo, history])

    useEffect(() => {
        if (userInfo) {
            const fetchConversations = async (id) => {
                const { data } = await axios.get(`/api/conversations/${id}`, config)
                setConversations(data)
            }
            fetchConversations(userInfo._id);
        } else {
            history.push('/login');
        }
    }, [history, userInfo, conversations])

    useEffect(() => {
        const friend = conversations.map((conversation) => conversation.participants.map((participant) => {
            if (participant !== userInfo._id) {
                const fetchUsers = async (friend) => {
                    const res = await axios(`/api/users/users/${friend}`);
                    setFriend(res.data)
                }
                fetchUsers(participant)
            }
        }))
    }, [userInfo, conversations])

    useEffect(() => {
        if (userInfo) {
            const fetchMessages = async (id) => {
                const { data } = await axios.get(`/api/messages/${id}`, config)
                setMessages(data)
            }
            fetchMessages(currentConversation?._id);
        } else {
            history.push('/login');
        }
    }, [dispatch, history, userInfo, messages])

    useEffect(() => {
        if (userInfo) {
            scrollRef.current?.scrollIntoView({ behavior: "auto" })
        } else {
            history.push('/login');
        }
    }, [dispatch, history, userInfo, messages])

    const submitHandler = async (e) => {
        e.preventDefault();
        const message = {
            sender: userInfo._id,
            contents: newMessage,
            conversationId: currentConversation._id,

        }

        const reciever = currentConversation.reciever

        socket.current.emit("sendMessage", {
            sender: userInfo._id,
            reciever,
            contents: newMessage
        })

        const res = await axios.post('/api/messages', message, config)
        setMessages([...messages, res.data])
    }

    return (
        <>
            <Container>
                <Card>
                    <Card.Body>
                        <Row>
                            <Col md={4}>
                                {
                                    conversations.map((conversation) => (
                                        <Card key={conversation._id}><Button onClick={() => {
                                            setCurrentConversation(conversation);
                                        }}>
                                            <Card.Body>
                                                <Card.Title>{friend.username}</Card.Title>
                                            </Card.Body>
                                        </Button></Card>
                                    ))
                                }

                            </Col>
                            <Col className="chatBox">
                                <Col md={8} className="chatBoxWrapper">
                                    {
                                        messages.map((message) => (
                                            <div ref={scrollRef}>
                                                <ChatMessage chatMessage={message} own={message.sender === userInfo._id} />
                                            </div>
                                        ))
                                    }
                                    <Form.Control onChange={(e) => setNewMessage(e.target.value)} value={newMessage} className="mx-2" as="textarea" style={{ borderLeft: 'none' }} placeholder="Write a message here" />
                                    <Button onClick={submitHandler} type="submit" variant="primary">Send</Button>
                                </Col>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        </>
    )
}

export default MessageScreen
