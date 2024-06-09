import React, { useState, useEffect } from "react";
import NavbarManager from '../components/NavbarLogado.js';
import '../estilos/Manager.css';
import axios from 'axios';
import moment from 'moment';

export default function Manager() {
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



    useEffect(() => {
        const tokenUtilizador = localStorage.getItem('userToken');
        if (!tokenUtilizador) {
            console.error('Token não encontrado');
            alert('Token não encontrado. Faça login novamente.');
            return;
        }

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

    useEffect(() => {
        fetchAllUserEvents();
    }, [currentMonth, currentYear]);

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
            console.error("Erro ao obter eventos de todos os usuários:", error.response ? error.response.data : error.message);
        }
    };


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
                alert('Evento aprovado com sucesso!');
            })
            .catch(error => {
                console.error('Erro ao aprovar evento:', error);
                alert('Erro ao aprovar evento. Tente novamente.');
            });
    };

    const handleReject = (id, type) => {
        const tokenUtilizador = localStorage.getItem('userToken');
        if (!tokenUtilizador) {
            console.error('Token não encontrado');
            alert('Token não encontrado. Faça login novamente.');
            return;
        }

        let endpoint = `http://127.0.0.1:5000/api/${type}/reject/${id}`;

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
                alert('Evento rejeitado com sucesso!');
            })
            .catch(error => {
                console.error('Erro ao rejeitar evento:', error);
                alert('Erro ao rejeitar evento. Tente novamente.');
            });
    };

    const toggleFerias = () => setMostrarFerias(!mostrarFerias);
    const toggleAusencias = () => setMostrarAusencias(!mostrarAusencias);
    const togglePresenciais = () => setMostrarPresenciais(!mostrarPresenciais);

    const renderEventosPendentes = (eventos, tipo) => {
        return eventos.length > 0 ? (
            eventos.map(evento => (
                <div key={evento.id} className="event-card">
                    <p>
                        <strong>{evento.user}</strong> - {moment(evento.date).format('DD/MM/YYYY')} - {evento.title}
                    </p>
                    <div className="event-actions">
                        <button onClick={() => handleApprove(evento.id, evento.type)}>Aprovar</button>
                        <button onClick={() => handleReject(evento.id, evento.type)}>Rejeitar</button>
                    </div>
                </div>
            ))
        ) : (
            <p>Não há {tipo} pendentes.</p>
        );
    };

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
