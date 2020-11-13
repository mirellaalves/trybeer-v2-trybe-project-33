/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
import { Redirect } from 'react-router-dom';
import React, {
  useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import AdminHeader from '../components/AdminHeader';

const { io } = window;

const AdminChat = (props) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const chatRoom = localStorage.getItem('chatRoom');

  const socket = useRef();

  useEffect(() => {
    const { history } = props;
    if (!user) return history.push('/login');
    socket.current = io('http://localhost:3001');
    return () => undefined;
  }, []);

  useEffect(() => {
    if (socket.current) {
      socket.current.emit('join', chatRoom);

      socket.current.on('history', (msgHistory) => {
        setMessages([...msgHistory]);
      });

      socket.current.on('message', (message) => {
        setNewMessage(message);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (newMessage) setMessages([...messages, newMessage]);
  }, [newMessage]);

  if (!user) return <Redirect to="/login" />;
  return (
    <div>
      <AdminHeader title="Chat" />
      <div className="chatContainer">
        <ul>
          {messages.map((msg, index) => (
            <li key={ `${msg.nick}${index}` }>
              <p data-testid="nickname">{msg.nick}</p>
              <p data-testid="text-message">{msg.message}</p>
              <p data-testid="message-time">{msg.time}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="chatBox">
        <input data-testid="message-input" value={ chat } onChange={ (event) => setChat(event.target.value) } />
        <button
          data-testid="send-message"
          type="button"
          onClick={ () => {
            const date = new Date();
            const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            socket.current.emit('message', {
              email: chatRoom, message: chat, nick: 'Loja', time,
            });
            setChat('');
          } }
        >
          Enviar
        </button>
      </div>
      <button
        type="button"
        data-testid="back-button"
        onClick={ () => props.history.push('/admin/chats') }
      >
        Voltar
      </button>
    </div>
  );
};

AdminChat.propTypes = {
  history: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default AdminChat;
