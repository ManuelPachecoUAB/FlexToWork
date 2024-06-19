import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../estilos/Admin.css';
import addUserIcon from '../img/add_user.png';
import searchUserIcon from '../img/search_user.png';
import addTeamIcon from '../img/add_teams.png';
import searchTeamIcon from '../img/search_teams.png';
import NavbarLogado from "../components/NavbarLogado.js";

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
    const [teamName, setTeamName] = useState('');
    const [teams, setTeams] = useState([]); // Novo estado para equipes
    const [accessLevels, setAccessLevels] = useState([]); // Novo estado para níveis de acesso
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [searchTeamQuery, setSearchTeamQuery] = useState('');
    const filteredTeams = teams.filter(team => team.nome.toLowerCase().includes(searchTeamQuery.toLowerCase()));

    useEffect(() => {
        fetchUsers();
        fetchTeams();
        fetchAccessLevels();
    }, []);

    // useEffect para limpar mensagens de sucesso e erro após 6 segundos
    useEffect(() => {
        if (sucesso) {
            const timer = setTimeout(() => {
                setSucesso('');
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [sucesso]);

    useEffect(() => {
        if (erro) {
            const timer = setTimeout(() => {
                setErro('');
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [erro]);

    function fetchUsers() {
        const userToken = localStorage.getItem('userToken');
        axios.get('http://127.0.0.1:5000/api/users', {
            headers: { Authorization: `Bearer ${userToken}` },
        })
            .then(response => setUsers(response.data))
            .catch(error => console.error('Failed to fetch users', error));
    }

    function fetchTeams() {
        const userToken = localStorage.getItem('userToken');
        axios.get('http://127.0.0.1:5000/api/teams',{
            headers: { Authorization: `Bearer ${userToken}` },
        })
            .then(response => setTeams(response.data))
            .catch(error => console.error('Failed to fetch teams', error));
    }

    function fetchAccessLevels() {
        const userToken = localStorage.getItem('userToken');
        axios.get('http://127.0.0.1:5000/api/access_levels',{
            headers: { Authorization: `Bearer ${userToken}` },
        })
            .then(response => setAccessLevels(response.data))
            .catch(error => console.error('Failed to fetch access levels', error));
    }

    function handleAddUser() {
        const userToken = localStorage.getItem('userToken');
        const erros = validarDados(email, primeironome, segundonome, password);
        if (!idequipa) {
            erros.push('Deve selecionar uma equipa');
        }

        if (!idnivel) {
            erros.push('Deve selecionar um nivel de acesso');
        }
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
        axios.post('http://127.0.0.1:5000/signup', newUser, {
            headers: { Authorization: `Bearer ${userToken}` },
        })

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

    function handleAddTeam() {
        const userToken = localStorage.getItem('userToken');
        if (teamName.length < 3) {
            setErro('O nome da equipa deve ter pelo menos 3 caracteres.');
            return;
        }
        axios.post('http://127.0.0.1:5000/api/add_equipa', { nomeequipa: teamName }, {
                headers: {Authorization: `Bearer ${userToken}`}
            })
            .then(() => {
                setTeamName('');
                setSucesso('Equipa criada com sucesso!');
                fetchTeams();
            })
            .catch(error => {
                console.error('Erro ao adicionar equipa', error);
                if (error.response && error.response.data && error.response.data.error) {
                    setErro('Erro ao adicionar equipa: ' + error.response.data.error);
                } else {
                    setErro('Erro ao adicionar equipa: An unknown error occurred.');
                }
            });
    }

    function handleDeleteUser(id) {
        const userToken = localStorage.getItem('userToken');
        if (window.confirm("Tem a certeza que deseja apagar este utilizador?")) {
            console.log('ID do utilizador a remover', id);
            axios.delete(`http://127.0.0.1:5000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            })
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
    }

    function handleDeleteTeam(id) {
        const userToken = localStorage.getItem('userToken');
        if (window.confirm("Tem certeza que deseja excluir esta equipa?")) {
            axios.delete(`http://127.0.0.1:5000/api/teams/${id}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            })
                .then(response => {
                    console.log('Equipa removida com sucesso!', response.data);
                    setSucesso(`Equipa removida com sucesso com o id: ${id}`);
                    setErro('');
                    fetchTeams();
                })
                .catch(error => {
                    console.error('Falha ao remover equipa!', error);
                    if (error.response && error.response.data && error.response.data.error) {
                        setErro(`Erro ao remover a equipa: ${error.response.data.error}`);
                    } else {
                        setErro(`Erro ao remover a equipa: Um erro desconhecido ocorreu.`);
                    }
                    setSucesso('');
                });
        }
    }

    function handleEditUser(user) {
        setSelectedUser(user);
        setEmail(user.email);
        setPrimeironome(user.primeironome);
        setSegundonome(user.segundonome);
        setIdequipa(user.idequipa);
        setIdnivel(user.idnivel);
        setPassword('');
        setView('editUser');
    }

    function handleEditTeam(team) {
        setSelectedTeam(team);
        setTeamName(team.nome);
        setView('editTeam');
    }

    function handleUpdateUser() {
        const userToken = localStorage.getItem('userToken');
        const updatedUser = {};
        let ifChanged = false; // para validar se nenhum dado alterado
        let modifiedAtributes = []; // para armazenar os campos alterados

        if (password && password.length < 8) {
            setErro('A Senha deve ter pelo menos 8 caracteres.');
            return;
        }
        if (password) {
            updatedUser.password = password;
            ifChanged = true;
            modifiedAtributes.push('senha');
        }
        if (idequipa && idequipa !== selectedUser.idequipa) {
            updatedUser.equipa = parseInt(idequipa, 10);
            ifChanged = true;
            modifiedAtributes.push('equipa');
        }
        if (idnivel && idnivel !== selectedUser.idnivel) {
            updatedUser.nivel = parseInt(idnivel, 10);
            ifChanged = true;
            modifiedAtributes.push('nível de acesso');
        }
        if (!ifChanged) {
            setErro('Não foi feita nenhuma alteração');
            return;
        }

        axios.put(`http://127.0.0.1:5000/api/users/${selectedUser.id}`, updatedUser, {
            headers: { Authorization: `Bearer ${userToken}` }
        })
            .then(response => {
                console.log('Utilizador atualizado com sucesso!', response.data);
                handleClearForm();
                setSucesso(`Utilizador atualizado com sucesso! Campos modificados: ${modifiedAtributes.join(', ')}.`);
                setErro('');
                fetchUsers();
                setView('viewUsers');
                setSearchQuery('');
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

    function handleUpdateTeam() {
        const userToken = localStorage.getItem('userToken');
        if (teamName.length < 3) {
            setErro('O nome da equipa deve ter pelo menos 3 caracteres.');
            return;
        }
        axios.put(`http://127.0.0.1:5000/api/teams/${selectedTeam.id}`, { nomeequipa: teamName }, {
            headers: { Authorization: `Bearer ${userToken}` }
        })
            .then(()=> {
                setTeamName('');
                setSucesso('Equipa atualizada com sucesso!');
                fetchTeams();
            })
            .catch(error => {
                console.error('Erro ao atualizar equipa', error);
                if (error.response && error.response.data && error.response.data.error) {
                    setErro('Erro ao atualizar equipa: ' + error.response.data.error);
                } else {
                    setErro('Erro ao atualizar equipa: Um erro desconhecido ocorreu.');
                }
            });
    }

    function validarDados(email, primeironome, segundonome, password, idequipa, idnivel) {
        const erros = [];
        if (!email.includes('@')) erros.push('Insira um endereço de Email válido');
        if (primeironome.length < 2) erros.push('O Nome deve ter pelo menos 2 caracteres');
        if (segundonome.length < 2) erros.push('O Apelido deve ter pelo menos 2 caracteres');
        if (password.length < 8) erros.push('A Senha deve ter pelo menos 8 caracteres');
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
        setTeamName('');
        setSearchTeamQuery('');
    }

    return (
        <div className="main-container">
            <NavbarLogado />
            <div className="page-container">
                {view === null && (
                <div className="icon-container">
                    <div className="icon-column">
                        <div className="icon-wrapper" onClick={() => setView('createUser')}>
                            <img src={addUserIcon} alt="Add User" className="icon" />
                            <div className="icon-label">Criar Utilizador</div>
                        </div>
                        <div className="icon-wrapper" onClick={() => setView('createTeam')}>
                            <img src={addTeamIcon} alt="Add Team" className="icon" />
                            <div className="icon-label">Criar Equipa</div>
                        </div>
                    </div>
                    <div className="icon-column">
                        <div className="icon-wrapper" onClick={() => setView('viewUsers')}>
                            <img src={searchUserIcon} alt="Search User" className="icon" />
                            <div className="icon-label">Ver Utilizadores</div>
                        </div>
                        <div className="icon-wrapper" onClick={() => setView('viewTeams')}>
                            <img src={searchTeamIcon} alt="Search Team" className="icon" />
                            <div className="icon-label">Ver Equipas</div>
                        </div>
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
                        <select value={idequipa} onChange={e => setIdequipa(e.target.value)}>
                            <option value="">Selecionar Equipa</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.nome}</option>
                            ))}
                        </select>
                        <select value={idnivel} onChange={e => setIdnivel(e.target.value)}>
                            <option value="">Selecionar Nível de Acesso</option>
                            {accessLevels.map(level => (
                                <option key={level.id} value={level.id}>{level.nome}</option>
                            ))}
                        </select>
                        <button className="admin-button" onClick={handleAddUser}>Adicionar Utilizador</button>
                        <button className="clear-button" onClick={handleClearForm}>Limpar Formulário</button>
                        <button className="admin-button" onClick={handleResetView}>Voltar</button>
                    </div>
                )}
                {view === 'viewUsers' && (
                    <div className="view-users-container">
                        <h1>Alterar/Apagar Utilizadores</h1>
                        {sucesso && <div className="sucesso">{sucesso}</div>}
                        {erro && <div className="erro">{erro}</div>}
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar por email"
                            className="search-input"
                        />
                        {searchQuery && (
                            <ul style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {filteredUsers.map(user => (
                                    <li key={user.id}>
                                        <span style={{ flexGrow: 1 }}>{user.email} - {user.primeironome}</span>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                                            <button onClick={() => handleEditUser(user)} className="action-button edit-button">Alterar</button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="action-button delete-button">Apagar</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button className="admin-button" onClick={handleResetView}>Voltar</button>
                    </div>
                )}
                {view === 'editUser' && (
                    <div className="create-user-form">
                        <h1>Editar Utilizador</h1>
                        {erro && <div className="erro">{erro}</div>}
                        {sucesso && <div className="sucesso">{sucesso}</div>}
                        <input type="email" value={email} placeholder="@Email" readOnly />
                        <input type="password" value={password || ''} onChange={e => setPassword(e.target.value)} placeholder="Senha" />
                        <select value={idequipa} onChange={e => setIdequipa(e.target.value)}>
                            <option value="" disabled>Selecionar Equipa</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.nome}
                                </option>
                            ))}
                        </select>
                        <select value={idnivel} onChange={e => setIdnivel(e.target.value)}>
                            <option value="" disabled>Selecionar Nível de Acesso</option>
                            {accessLevels.map(level => (
                                <option key={level.id} value={level.id}>
                                    {level.nome}
                                </option>
                            ))}
                        </select>
                        <button className="admin-button" onClick={handleUpdateUser}>Atualizar Utilizador</button>
                        <button className="admin-button" onClick={handleResetView}>Voltar</button>
                    </div>
                )}
                {view === 'createTeam' && ( /* Novo formulário para criar equipa */
                    <div className="create-user-form">
                        <h1>Criar Equipa</h1>
                        {erro && <div className="erro">{erro}</div>}
                        {sucesso && <div className="sucesso">{sucesso}</div>}
                        <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Nome da Equipa" />
                        <button className="admin-button" onClick={handleAddTeam}>Adicionar Equipa</button>
                        <button className="admin-button" onClick={handleResetView}>Voltar</button>
                    </div>
                )}
                {view === 'viewTeams' && (
                    <div className="view-users-container">
                        <h1>Alterar/Apagar Equipas</h1>
                        <input
                            type="text"
                            value={searchTeamQuery}
                            onChange={e => setSearchTeamQuery(e.target.value)}
                            placeholder="Pesquisar por nome da equipa"
                            className="search-input"
                        />
                        {sucesso && <div className="sucesso">{sucesso}</div>}
                        {erro && <div className="erro">{erro}</div>}
                        {searchTeamQuery && (
                            <ul style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {filteredTeams.map(team => (
                                    <li key={team.id}>
                                        <span style={{ flexGrow: 1 }}>{team.nome}</span>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                                            <button onClick={() => handleEditTeam(team)} className="action-button edit-button">Alterar</button>
                                            <button onClick={() => handleDeleteTeam(team.id)} className="action-button delete-button">Excluir</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button className="admin-button" onClick={handleResetView}>Voltar</button>
                    </div>
                )}
                {view === 'editTeam' && (
                    <div className="create-user-form">
                        <h1>Editar Nome da Equipa</h1>
                        {erro && <div className="erro">{erro}</div>}
                        {sucesso && <div className="sucesso">{sucesso}</div>}
                        <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Nome da Equipa" />
                        <button className="admin-button" onClick={handleUpdateTeam}>Atualizar Equipa</button>
                        <button className="admin-button" onClick={handleResetView}>Voltar</button>
                    </div>
                )}
            </div>
        </div>
    );
}