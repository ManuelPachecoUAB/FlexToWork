import React, { useState, useEffect } from "react";
import NavbarManager from '../components/NavbarLogado.js';
import '../estilos/Manager.css';
import axios from 'axios';
import moment from 'moment';

export default function Manager() {
    const [feriasPendentes, setFeriasPendentes] = useState([]);
    const [ausenciasPendentes, setAusenciasPendentes] = useState([]);
    const [presenciaisPendentes, setPresenciaisPendentes] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [mostrarFerias, setMostrarFerias] = useState(false);
    const [mostrarAusencias, setMostrarAusencias] = useState(false);
    const [mostrarPresenciais, setMostrarPresenciais] = useState(false);

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

    return (
        <div className="main-container">
            <NavbarManager />
            <div className="container-manager">
                <div className="team-members">
                    <h2>Membros da Equipa</h2>
                    <ul>
                        {teamMembers.map(member => (
                            <li key={member.id}><b>{member.posicao} - </b>{member.primeironome} {member.segundonome}</li>
                        ))}
                    </ul>
                </div>
                <div className="pending-events">
                    <h2>Marcações Pendentes</h2>
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
