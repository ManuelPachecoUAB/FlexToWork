import React, { useState, useEffect } from "react";
import axios from "axios";
import NavbarAdmin from '../components/NavbarAdmin';

export default function Admin() {
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState("");
    const [primeironome, setPrimeironome] = useState("");
    const [segundonome, setSegundonome] = useState("");
    const [password, setPassword] = useState("");
    const [idequipa, setIdequipa] = useState("");
    const [idnivel, setIdnivel] = useState("");

    // Função para carregar os usuários
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };


    const handleAddUser = async () => {
        const newUser = {
            email, primeironome, segundonome, password, idequipa, idnivel
        };
        try {
            await axios.post('/api/users', newUser);
            setEmail('');
            setPrimeironome('');
            setSegundonome('');
            setPassword('');
            setIdequipa('');
            setIdnivel('');
            fetchUsers();
        } catch (error) {
            console.error("Failed to add user", error);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await axios.delete(`/api/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };


    return (
        <div>
            <NavbarAdmin />
            <div className="page-container">
                <button onClick={() => setShowCreateUser(true)}>Criar Utilizador</button>
                <button onClick={() => setShowCreateUser(false)}>Ver Utilizadores</button>

                {showCreateUser ? (
                    <div>
                        <h1>Criar Utilizador</h1>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                        <input type="text" value={primeironome} onChange={(e) => setPrimeironome(e.target.value)} placeholder="Primeiro Nome" />
                        <input type="text" value={segundonome} onChange={(e) => setSegundonome(e.target.value)} placeholder="Segundo Nome" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
                        <input type="number" value={idequipa} onChange={(e) => setIdequipa(e.target.value)} placeholder="ID Equipe" />
                        <input type="number" value={idnivel} onChange={(e) => setIdnivel(e.target.value)} placeholder="Nível de Acesso" />
                        <button onClick={handleAddUser}>Adicionar Utilizador</button>
                    </div>
                ) : (
                    <div>
                        <h1>Alterar/Deletar Utilizadores</h1>
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
