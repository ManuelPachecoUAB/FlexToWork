import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/NavbarLogado.js';
import '../estilos/Admin.css';
import addUserIcon from '../img/add_user.png';
import searchUserIcon from '../img/search_user.png';

export default function Admin() {
    const [view, setView] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [email, setEmail] = useState('');
    const [primeironome, setPrimeironome] = useState('');
    const [segundonome, setSegundonome] = useState('');
    const [password, setPassword] = useState('');
    const [idequipa, setIdequipa] = useState('');
    const [idnivel, setIdnivel] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [erro, setErro] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const filteredUsers = users.filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase()));

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
        axios.post('http://localhost:5000/signup', newUser)
            .then(() => {
                setEmail('');
                setPrimeironome('');
                setSegundonome('');
                setPassword('');
                setIdequipa('');
                setIdnivel('');
                fetchUsers();
                setSucesso('Utilizador criado com sucesso!');
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
                setSucesso(`Removido com sucesso o utilizador com o id: ${id}`);
                setErro('');
                fetchUsers(); // Atualizar a lista de utilizadores após remoção
            })
            .catch(error => {
                console.error('Falha ao remover utilizador!', error);
                if (error.response && error.response.data && error.response.data.error) {
                    setErro(`Erro ao remover o utilizador com o id: ${id}: ${error.response.data.error}`);
                } else {
                    setErro(`Erro ao remover o utilizador com o id: ${id}: Um erro desconhecido ocorreu.`);
                }
                setSucesso(''); // Limpa a mensagem de sucesso se a remoção falhar
            });
    }

    function handleEditUser(user) {
        setSelectedUser(user);
        setEmail(user.email);
        setPrimeironome(user.primeironome);
        setSegundonome(user.segundonome);
        setIdequipa(user.equipa);
        setIdnivel(user.nivel);
        setPassword('');
        setView('editUser');
    }

    function handleUpdateUser() {
        const updatedUser = {};
        if (password) updatedUser.password = password;
        if (idequipa) updatedUser.equipa = parseInt(idequipa, 10);
        if (idnivel) updatedUser.nivel = parseInt(idnivel, 10);

        axios.put(`/api/users/${selectedUser.id}`, updatedUser)
            .then(response => {
                console.log('Utilizador atualizado com sucesso!', response.data);
                setSucesso('Utilizador atualizado com sucesso!');
                setErro('');
                fetchUsers();
                handleClearForm();
                setView('viewUsers');
            })
            .catch(error => {
                console.error('Erro ao atualizar utilizador', error);
                if (error.response && error.response.data && error.response.data.error) {
                    setErro('Erro ao atualizar utilizador: ' + error.response.data.error);
                } else {
                    setErro('Erro ao atualizar utilizador: An unknown error occurred.');
                }
            });
    }

    function validarDados(email, primeironome, segundonome, password, idequipa, idnivel) {
        const erros = [];
        if (!email.includes('@')) erros.push('Email inválido.');
        if (primeironome.length < 2) erros.push('Primeiro nome muito pequeno.');
        if (segundonome.length < 2) erros.push('Sobrenome muito pequeno.');
        if (password.length < 6) erros.push('Senha deve ter pelo menos 6 caracteres.');
        if (!Number.isInteger(+idequipa) || idequipa < 1 || idequipa > 10) erros.push('ID de equipa deve ser numérico e entre 1 e 10.');
        if (!Number.isInteger(+idnivel) || idnivel < 1 || idnivel > 5) erros.push('Nível de acesso deve ser numérico e entre 1 e 5.');
        return erros;
    }

    function handleClearForm() {
        setEmail('');
        setPrimeironome('');
        setSegundonome('');
        setPassword('');
        setIdequipa('');
        setIdnivel('');
        setSucesso('');
        setErro('');
    }

    function handleResetView(){
        handleClearForm();
        setView(null);
        setSearchQuery('');
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
                    <div className="create-user-form">
                        <h1>Criar Utilizador</h1>
                        {erro && <div className="erro">{erro}</div>}
                        {sucesso && <div className="sucesso">{sucesso}</div>}
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="@Email" />
                        <input type="text" value={primeironome} onChange={e => setPrimeironome(e.target.value)} placeholder="Nome" />
                        <input type="text" value={segundonome} onChange={e => setSegundonome(e.target.value)} placeholder="Apelido" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" />
                        <input type="number" value={idequipa} onChange={e => setIdequipa(e.target.value)} placeholder="ID Equipa" min="1" max="10" />
                        <input type="number" value={idnivel} onChange={e => setIdnivel(e.target.value)} placeholder="Nível de Acesso" min="1" max="5" />
                        <button className="admin-button" onClick={handleAddUser}>Adicionar Utilizador</button>
                        <button className="clear-button" onClick={handleClearForm}>Limpar Formulário</button>
                        <button className="admin-button" onClick={handleResetView}>Voltar</button>
                    </div>
                )}
                {view === 'editUser' && (
                    <div className="create-user-form">
                        <h1>Editar Utilizador</h1>
                        {erro && <div className="erro">{erro}</div>}
                        {sucesso && <div className="sucesso">{sucesso}</div>}
                        <input type="email" value={email} placeholder="@Email" readOnly />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" />
                        <input type="number" value={idequipa} onChange={e => setIdequipa(e.target.value)} placeholder="ID Equipa" min="1" max="10" />
                        <input type="number" value={idnivel} onChange={e => setIdnivel(e.target.value)} placeholder="Nível de Acesso" min="1" max="5" />
                        <button className="admin-button" onClick={handleUpdateUser}>Atualizar Utilizador</button>
                        <button className="clear-button" onClick={handleClearForm}>Limpar Formulário</button>
                        <button className="admin-button" onClick={handleResetView}>Voltar</button>
                    </div>
                )}
                {view === 'viewUsers' && (
                    <div className="view-users-container">
                        <h1>Alterar/Apagar Utilizadores</h1>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar por email"
                            className="search-input"
                        />
                        {sucesso && <div className="sucesso">{sucesso}</div>}
                        {erro && <div className="erro">{erro}</div>}
                        {searchQuery && (
                            <ul style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {filteredUsers.map(user => (
                                    <li key={user.id}>
                                        <span style={{ flexGrow: 1 }}>{user.email} - {user.primeironome}</span>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                                            <button onClick={() => handleEditUser(user)} className="action-button edit-button">Alterar</button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="action-button delete-button">Excluir</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button className="admin-button" onClick={handleResetView}>Voltar</button>
                    </div>
                )}
            </div>
        </div>
    );
}