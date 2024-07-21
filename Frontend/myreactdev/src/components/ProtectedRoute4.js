import React, { useState, useEffect } from 'react';
import axios from "axios";

const ProtectedRoute4 = ({ children }) => {
    const [isAllowed, setIsAllowed] = useState(true);
    const isAuthenticated = localStorage.getItem('userToken');
    const [nivelutilisador, setNivelutilisador] = useState(null);

    useEffect(() => {
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            axios.get(`http://127.0.0.1:5000/api/usernivel`, {
                headers: {Authorization: `Bearer ${userToken}`}
            })
                .then(response => {
                    const nivel = response.data.nivel;
                    setNivelutilisador(nivel);
                    if (!isAuthenticated || ![5].includes(nivel)) {  // Alterado para verificar se o nível é '2'
                        setIsAllowed(false);                  // Atualiza o estado para não permitido
                    } else {
                        setIsAllowed(true);
                    }
                })
                .catch(error => {
                    console.error('Erro:', error.response ? error.response.data.error : error);
                    alert(`Erro: ${error.response ? error.response.data.error : error.message}. Tente novamente.`);
                    setIsAllowed(false);
                });
        } else {
            setIsAllowed(false);
        }
    }, [isAuthenticated]);
    if (!isAllowed) {
        // Mostra uma mensagem ou componente específico que não requer mudança de página
        return <div>Access Denied. You are not allowed to view this page.</div>;
    }

    // Renderiza os componentes filhos se estiver autenticado e com o nível correto
    return children;
};

export default ProtectedRoute4;
