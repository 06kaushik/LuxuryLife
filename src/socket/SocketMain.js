// useSocket.js
import { useContext } from 'react';
import { SocketContext } from '../components/SocketContext';

const useSocket = () => useContext(SocketContext);

export default useSocket;
