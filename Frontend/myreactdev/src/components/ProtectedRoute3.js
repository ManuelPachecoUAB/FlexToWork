import React, { useState, useEffect } from 'react';

const ProtectedRoute3 = ({ children }) => {
    const [isAllowed, setIsAllowed] = useState(true);
    const isAuthenticated = localStorage.getItem('userToken');
    const nivel = localStorage.getItem('nivel');

    useEffect(() => {
        if (!isAuthenticated || (nivel !== '3' && nivel !== '4' && nivel !== '5')) {  // Alterado para verificar se o nível é '3'
            localStorage.removeItem('nivel');     // Limpa o nível de acesso inadequado
            setIsAllowed(false);                  // Atualiza o estado para não permitido
        }
    }, [isAuthenticated, nivel]);

    if (!isAllowed) {
        // Mostra uma mensagem ou componente específico que não requer mudança de página
        return <div>Access Denied. You are not allowed to view this page.</div>;
    }

    // Renderiza os componentes filhos se estiver autenticado e com o nível correto
    return children;
};


export default ProtectedRoute3;