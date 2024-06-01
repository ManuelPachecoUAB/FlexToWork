import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/NavbarLogado.js';
import '../estilos/Admin.css';

export default function Admin() {
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState('');
    const [primeironome, setPrimeironome] = useState('');
    const [segundonome, setSegundonome] = useState('');
    const [password, setPassword] = useState('');
    const [idequipa, setIdequipa] = useState('');
    const [idnivel, setIdnivel] = useState('');
    const [erro, setErro] = useState('');

    axios.defaults.baseURL = 'http://localhost:5000';
    axios.defaults.withCredentials = true;
    axios.interceptors.request.use(
        config => {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.log('Token não encontrado, cabeçalho de autorização não será adicionado.');
            }
            return config;
        },
        error => Promise.reject(error)
    );

    useEffect(() => {
        fetchUsers();
    }, []);

    function fetchUsers() {
        axios.get('/api/users')
            .then(response => setUsers(response.data))
            .catch(error => console.error('Failed to fetch users', error));
    }

    function handleAddUser() {
        const erros = validarDados(email, primeironome, segundonome, password, idequipa, idnivel);
        if (erros.length > 0) {
            setErro(erros.join(', '));
            return;
        }
        setErro('');
        const newUser = { email, primeironome, segundonome, password, idequipa, idnivel };
        axios.post('/api/users', newUser)
            .then(() => {
                setEmail('');
                setPrimeironome('');
                setSegundonome('');
                setPassword('');
                setIdequipa('');
                setIdnivel('');
                fetchUsers();
            })
            .catch(error => console.error('Failed to add user', error));
    }

    function handleDeleteUser(id) {
        console.log('ID do utilizador a remover', id);
        axios.delete(`/api/users/${id}`)
            .then(response => {
                console.log('Utilizador removido com sucesso!', response.data);
                fetchUsers(); // Atualizar a lista de utilizadores após remoção
            })
            .catch(error => {
                console.error('Falha ao remover utilizador!', error);
            });
    }

    function validarDados(email, primeironome, segundonome, password, idequipa, idnivel) {
        const erros = [];
        if (!email.includes('@')) erros.push('Email inválido.');
        if (primeironome.length < 2) erros.push('Primeiro nome muito curto.');
        if (segundonome.length < 2) erros.push('Sobrenome muito curto.');
        if (password.length < 6) erros.push('Senha deve ter pelo menos 6 caracteres.');
        if (!Number.isInteger(+idequipa)) erros.push('ID de equipe deve ser numérico.');
        if (!Number.isInteger(+idnivel)) erros.push('Nível de acesso deve ser numérico.');
        return erros;
    }

    return (
        <div className="admin-page">
            <NavbarAdmin />
            <div className="page-container">
                <button className="admin-button" onClick={() => setShowCreateUser(true)}>Criar Utilizador</button>
                <button className="admin-button" onClick={() => setShowCreateUser(false)}>Ver Utilizadores</button>
                {showCreateUser ? (
                    <div>
                        <h1>Criar Utilizador</h1>
                        {erro && <div className="erro">{erro}</div>}
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                        <input type="text" value={primeironome} onChange={e => setPrimeironome(e.target.value)} placeholder="Primeiro Nome" />
                        <input type="text" value={segundonome} onChange={e => setSegundonome(e.target.value)} placeholder="Segundo Nome" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" />
                        <input type="number" value={idequipa} onChange={e => setIdequipa(e.target.value)} placeholder="ID Equipe" />
                        <input type="number" value={idnivel} onChange={e => setIdnivel(e.target.value)} placeholder="Nível de Acesso" />
                        <button onClick={handleAddUser}>Adicionar Utilizador</button>
                    </div>
                ) : (
                    <div>
                        <h1>Alterar/Apagar Utilizadores</h1>
                        <ul style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {users.map(user => (
                                <li key={user.id}>
                                    {user.email} - {user.primeironome}
                                    <button onClick={() => handleDeleteUser(user.id)}>Excluir</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}