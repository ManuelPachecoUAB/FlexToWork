import React, { useState, useEffect } from "react";
import NavbarManager from '../components/NavbarLogado.js';
import '../estilos/Manager.css';
import axios from 'axios';
import moment from 'moment';

// Componente principal para a página Manager
export default function Manager() {
    // Estados para armazenar data selecionada, eventos dos utilizadores, eventos pendentes, membros da equipa, e visibilidade de seções
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [allUserEvents, setAllUserEvents] = useState([]);
    const [feriasPendentes, setFeriasPendentes] = useState([]);
    const [ausenciasPendentes, setAusenciasPendentes] = useState([]);
    const [presenciaisPendentes, setPresenciaisPendentes] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [mostrarFerias, setMostrarFerias] = useState(false);
    const [mostrarAusencias, setMostrarAusencias] = useState(false);
    const [mostrarPresenciais, setMostrarPresenciais] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
    const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
    const [formattedEvents, setFormattedEvents] = useState([]);

    // useEffect para procurar eventos pendentes e membros da equipa ao carregar o componente
    useEffect(() => {
        const tokenUtilizador = localStorage.getItem('userToken');
        if (!tokenUtilizador) {
            console.error('Token não encontrado');
            alert('Token não encontrado. Faça login novamente.');
            return;
        }

        // Procura eventos pendentes da equipa
        axios.get('http://127.0.0.1:5000/api/get_team_events', {
            headers: { Authorization: `Bearer ${tokenUtilizador}` }
        })
            .then(response => {
                const eventos = response.data;
                setFeriasPendentes(eventos.filter(evento => evento.type === 'ferias'));
                setAusenciasPendentes(eventos.filter(evento => evento.type === 'ausencias'));
                setPresenciaisPendentes(eventos.filter(evento => evento.type === 'presencial'));
            })
            .catch(error => {
                console.error('Erro ao carregar eventos pendentes:', error);
                alert('Erro ao carregar eventos pendentes. Tente novamente.');
            });

        // Procura membros da equipa
        axios.get('http://127.0.0.1:5000/api/team_members', {
            headers: { Authorization: `Bearer ${tokenUtilizador}` }
        })
            .then(response => {
                setTeamMembers(response.data);
            })
            .catch(error => {
                console.error('Erro ao carregar membros da equipe:', error);
                alert('Erro ao carregar membros da equipe. Tente novamente.');
            });
    }, []);

    // useEffect para procurar eventos de todos os utilizadores quando o mês ou ano atual muda
    useEffect(() => {
        fetchAllUserEvents();
    }, [currentMonth, currentYear]);

    // Função para procurar eventos de todos os utilizadores
    const fetchAllUserEvents = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                console.error("Token JWT não encontrado");
                return;
            }
            let response;
            response = await axios.get('http://localhost:5000/api/eventos_equipa_manager', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const eventsData = response.data;
            if (Array.isArray(eventsData)) {
                setAllUserEvents(eventsData);
                formatEvents(eventsData);
            } else {
                console.error("Unexpected response format:", eventsData);
            }
        } catch (error) {
            console.error("Erro ao obter eventos de todos os utilizadores:", error.response ? error.response.data : error.message);
        }
    };

    // Função para mudar o mês atual
    const handleMonthChange = (direction) => {
        let newDate;
        if (direction === 'prev') {
            newDate = new Date(currentYear, currentMonth - 1);
        } else {
            newDate = new Date(currentYear, currentMonth + 1);
        }
        setCurrentMonth(newDate.getMonth());
        setCurrentYear(newDate.getFullYear());
        setSelectedDate(newDate);
    };

    // Função para mudar o ano atual
    const handleYearChange = (direction) => {
        let newDate;
        if (direction === 'prev') {
            newDate = new Date(currentYear - 1, currentMonth);
        } else {
            newDate = new Date(currentYear + 1, currentMonth);
        }
        setCurrentYear(newDate.getFullYear());
        setSelectedDate(newDate);
    };

    // Função para formatar eventos
    const formatEvents = (events) => {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const formatted = events.map(userEvents => {
            const days = Array(daysInMonth).fill('');
            userEvents.ferias.forEach(event => {
                const date = new Date(event.data);
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    days[date.getDate() - 1] = event.estado === 1 ? 'F-P' : 'F';
                }
            });
            userEvents.ausencias.forEach(event => {
                const date = new Date(event.data);
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    days[date.getDate() - 1] = event.estado === 1 ? 'A-P' : 'A';
                }
            });
            userEvents.presenciais.forEach(event => {
                const date = new Date(event.data);
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    days[date.getDate() - 1] = event.estado === 1 ? 'P-P' : 'P';
                }
            });
            return { user: userEvents.user, days };
        });
        setFormattedEvents(formatted);
    };

    // Função para aprovar um evento
    const handleApprove = (id, type) => {
        const tokenUtilizador = localStorage.getItem('userToken');
        if (!tokenUtilizador) {
            console.error('Token não encontrado');
            alert('Token não encontrado. Faça login novamente.');
            return;
        }

        let endpoint = `http://127.0.0.1:5000/api/${type}/approve/${id}`;

        axios.put(endpoint, {}, {
            headers: { Authorization: `Bearer ${tokenUtilizador}` }
        })
            .then(response => {
                if (type === 'ferias') {
                    setFeriasPendentes(feriasPendentes.filter(evento => evento.id !== id));
                } else if (type === 'ausencias') {
                    setAusenciasPendentes(ausenciasPendentes.filter(evento => evento.id !== id));
                } else if (type === 'presencial') {
                    setPresenciaisPendentes(presenciaisPendentes.filter(evento => evento.id !== id));
                }
                console.log('Evento aprovado com sucesso!');
                fetchAllUserEvents();
            })
            .catch(error => {
                console.error('Erro ao aprovar evento:', error);
                alert('Erro ao aprovar evento. Tente novamente.');
            });
    };

    // Função para rejeitar um evento
    const handleReject = (id, type) => {
        const tokenUtilizador = localStorage.getItem('userToken');
        if (!tokenUtilizador) {
            console.error('Token não encontrado');
            alert('Token não encontrado. Faça login novamente.');
            return;
        }
        let texto='';
        texto = prompt("Razão da Rejeição: ","text");
        console.log(texto);
            let endpoint = '';
            if (type === "ferias") {
                endpoint = `http://127.0.0.1:5000/api/ferias/reject/${id}`;
            } else if (type === "ausencias") {
                endpoint = `http://127.0.0.1:5000/api/ausencias/reject/${id}`;
            } else if (type === "presencial") {
                endpoint = `http://127.0.0.1:5000/api/presencial/reject/${id}`;
            }
            const newNotification = {
                texto,
                id,
                type
            };
            axios.post('http://127.0.0.1:5000/api/notificacao', newNotification, {
                headers: {Authorization: `Bearer ${tokenUtilizador}`}
            })
                .then(() => {
                    texto = '';
                    console.log('Notificação enviada ao colaborador!');
                })
                .catch(error => {
                    console.error('Erro ao remover marcação:', error.response ? error.response.data.error : error);
                    alert(`Erro ao remover marcação: ${error.response ? error.response.data.error : error.message}. Tente novamente.`);
                });
            axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${tokenUtilizador}` }
            })
                .then(response => {
                    if (type === 'ferias') {
                        setFeriasPendentes(feriasPendentes.filter(evento => evento.id !== id));
                    } else if (type === 'ausencias') {
                        setAusenciasPendentes(ausenciasPendentes.filter(evento => evento.id !== id));
                    } else if (type === 'presencial') {
                        setPresenciaisPendentes(presenciaisPendentes.filter(evento => evento.id !== id));
                    }
                    fetchAllUserEvents(); // Atualiza os eventos após deletar
                    console.log('Marcação removida com sucesso!');
                })
                .catch(error => {
                    console.error('Erro ao remover marcação:', error.response ? error.response.data.error : error);
                    alert(`Erro ao remover marcação: ${error.response ? error.response.data.error : error.message}. Tente novamente.`);
                });
    };

    // Funções para alternar a visibilidade das seções de eventos pendentes
    const toggleFerias = () => setMostrarFerias(!mostrarFerias);
    const toggleAusencias = () => setMostrarAusencias(!mostrarAusencias);
    const togglePresenciais = () => setMostrarPresenciais(!mostrarPresenciais);

    // Função para renderizar eventos pendentes
    const renderEventosPendentes = (eventos, tipo) => {
        return eventos.length > 0 ? (
            eventos.map(evento => (
                <div key={evento.id} className="event-card">
                    <p>
                        <strong>{evento.user}</strong> - {moment(evento.date).format('DD/MM/YYYY')} - {evento.title}
                        <button className="buttonAprovar" onClick={() => handleApprove(evento.id, evento.type)}>Aprovar</button>
                        <button className="buttonRejeitar" onClick={() => handleReject(evento.id, evento.type)}>Rejeitar</button>
                    </p>
                </div>
            ))
        ) : (
            <p>Não há {tipo} pendentes.</p>
        );
    };

    // Função para formatar data
    const formatDate = (date) => {
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
    };

    return (
        <div className="main-container">
            <NavbarManager />
            <div className="container-manager">
                <div className="month-selector">
                    <button onClick={() => handleYearChange('prev')}>&laquo;</button>
                    <button onClick={() => handleMonthChange('prev')}>&lsaquo;</button>
                    <span>{formatDate(selectedDate)}</span>
                    <button onClick={() => handleMonthChange('next')}>&rsaquo;</button>
                    <button onClick={() => handleYearChange('next')}>&raquo;</button>
                </div>
                <div className="all-users-events">
                    <h2>Plano mensal equipa</h2>
                    <table className="events-table">
                        <thead>
                        <tr>
                            <th>Nome do Colaborador</th>
                            {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }, (_, i) => (
                                <th key={i + 1}>{String(i + 1).padStart(2, '0')}/{String(currentMonth + 1).padStart(2, '0')}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {formattedEvents.map((userEvents, index) => (
                            <tr key={index}>
                                <td>{userEvents.user.primeironome} {userEvents.user.segundonome}</td>
                                {userEvents.days.map((day, i) => (
                                    <td key={i} className={day}>{day}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="pending-events">
                    <h2>Aprovações Pendentes</h2>
                    <div className="event-section">
                        <h3 onClick={toggleFerias} className="expandable-title">Férias</h3>
                        {mostrarFerias && (
                            <div className="pending-events-list">
                                {renderEventosPendentes(feriasPendentes, "férias")}
                            </div>
                        )}
                    </div>
                    <div className="event-section">
                        <h3 onClick={toggleAusencias} className="expandable-title">Ausências</h3>
                        {mostrarAusencias && (
                            <div className="pending-events-list">
                                {renderEventosPendentes(ausenciasPendentes, "ausências")}
                            </div>
                        )}
                    </div>
                    <div className="event-section">
                        <h3 onClick={togglePresenciais} className="expandable-title">Presenciais</h3>
                        {mostrarPresenciais && (
                            <div className="pending-events-list">
                                {renderEventosPendentes(presenciaisPendentes, "presenciais")}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
