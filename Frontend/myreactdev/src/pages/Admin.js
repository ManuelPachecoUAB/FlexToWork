import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/NavbarLogado.js';
import '../estilos/Admin.css';
import addUserIcon from '../img/add_user.png';
import searchUserIcon from '../img/search_user.png';

export default function Admin() {
    const [view, setView] = useState(null);
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
        const newUser = {
            email,
            primeironome,
            segundonome,
            password,
            equipa: parseInt(idequipa, 10),  // Converte para inteiro
            nivel: parseInt(idnivel, 10)  // Converte para inteiro
        };
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
            .catch(error => {
                console.error('Erro ao adicionar utilizador', error);
                if (error.response && error.response.data && error.response.data.error) {
                    setErro('Erro ao adicionar utilizador: ' + error.response.data.error);
                } else {
                    setErro('Erro ao adicionar utilizador: An unknown error occurred.');
                }
            });
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
                {view === null && (
                    <div className="icon-container">
                        <div className="icon-wrapper" onClick={() => setView('createUser')}>
                            <img src={addUserIcon} alt="Add User" className="icon" />
                            <div className="icon-label">Criar Utilizador</div>
                        </div>
                        <div className="icon-wrapper" onClick={() => setView('viewUsers')}>
                            <img src={searchUserIcon} alt="Search User" className="icon" />
                            <div className="icon-label">Ver Utilizadores</div>
                        </div>
                    </div>
                )}
                {view === 'createUser' && (
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
                        <button className="admin-button" onClick={() => setView(null)}>Voltar</button>
                    </div>
                )}
                {view === 'viewUsers' && (
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
                        <button className="admin-button" onClick={() => setView(null)}>Voltar</button>
                    </div>
                )}
            </div>
        </div>
    );
}