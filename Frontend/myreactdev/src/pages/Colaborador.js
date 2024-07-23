import React, { useState, useEffect } from "react";
import NavbarColaborador from '../components/NavbarLogado.js';
import '../estilos/Colaborador.css';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from 'axios';

// Componente principal para a página do colaborador
export default function Colaborador() {
    // Estados para armazenar datas selecionadas, eventos, métricas, mês e ano atuais, e notificações
    const [selectedDates, setSelectedDates] = useState([]);
    const [events, setEvents] = useState([]);
    const [metrics, setMetrics] = useState({
        presencialAprovadas: 0,
        presencialPendentes: 0,
        presencialObrigatorias: 0,
        ausenciasAprovadas: 0,
        ausenciasPendentes: 0,
        feriasAprovadas: 0,
        feriasPendentes: 0,
        feriasPorMarcar: 0,
    });
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [notificacoes, setNotificacoes] = useState([]);
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Função para procurar eventos do utilizador
    const fetchUserEvents = (ano, mes) => {
        const userToken = localStorage.getItem('userToken');
        axios.get('http://127.0.0.1:5000/api/get_user_events', {
            headers: { Authorization: `Bearer ${userToken}` },
            params: { ano: ano, mes: mes }
        })
            .then(response => {
                const userEvents = response.data;
                const newEvents = [];
                let metricsUpdate = {
                    presencialAprovadas: 0,
                    presencialPendentes: 0,
                    presencialObrigatorias: 10,
                    ausenciasAprovadas: 0,
                    ausenciasPendentes: 0,
                    feriasAprovadas: 0,
                    feriasPendentes: 0,
                    feriasPorMarcar: userEvents.ferias_disponiveis || 0,
                };

                // Processar eventos de férias
                userEvents.ferias.forEach(event => {
                    newEvents.push({
                        id: event.id,
                        date: new Date(event.data),
                        title: "Férias",
                        status: event.estado === 1 ? "pending" : "approved"
                    });
                    if (event.estado === 1) {
                        metricsUpdate.feriasPendentes += 1;
                    } else {
                        metricsUpdate.feriasAprovadas += 1;
                    }
                });

                // Processar eventos de ausências
                userEvents.ausencias.forEach(event => {
                    newEvents.push({
                        id: event.id,
                        date: new Date(event.data),
                        title: "Ausência",
                        status: event.estado === 1 ? "pending" : "approved"
                    });
                    if (event.estado === 1) {
                        metricsUpdate.ausenciasPendentes += 1;
                    } else {
                        metricsUpdate.ausenciasAprovadas += 1;
                    }
                });

                // Processar eventos de presença
                userEvents.presenciais.forEach(event => {
                    newEvents.push({
                        id: event.id,
                        date: new Date(event.data),
                        title: "Presencial",
                        status: event.estado === 1 ? "pending" : "approved"
                    });
                    if (event.estado === 1) {
                        metricsUpdate.presencialPendentes += 1;
                    } else {
                        metricsUpdate.presencialAprovadas += 1;
                    }
                });

                setEvents(newEvents);
                setMetrics(metricsUpdate);
            })
            .catch(error => {
                console.error('Erro ao carregar eventos do utilizador:', error);
                alert('Erro ao carregar eventos do utilizador. Tente novamente.');
            });
    };

    // Função chamada ao clicar numa data no calendário
    const Date_Click_Fun = (date) => {
        const dateString = date.toDateString();
        const event = events.find(event => event.date.toDateString() === dateString);

        const selectedEvent = selectedDates.some(selectedDate => events.find(event => event.date.toDateString() === selectedDate.toDateString()));

        if (selectedEvent || event) {
            console.log(`Data ${dateString} já está marcada ou outra data com marcação está selecionada. Selecionando apenas ${dateString}.`);
            setSelectedDates([date]);
        } else {
            if (selectedDates.some(selectedDate => selectedDate.toDateString() === dateString)) {
                setSelectedDates(selectedDates.filter(selectedDate => selectedDate.toDateString() !== dateString));
            } else {
                setSelectedDates([...selectedDates, date]);
            }
        }
    };

    // Função para criar eventos (férias, ausência, presencial)
    const Create_Event_Fun = (type) => {
        const userToken = localStorage.getItem('userToken');
        if (selectedDates.length > 0) {
            const dateStrings = selectedDates.map(date => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
            const requestData = { datas: dateStrings };

            let endpoint = '';
            if (type === "Férias") {
                endpoint = 'http://127.0.0.1:5000/api/ferias';
            } else if (type === "Ausência") {
                endpoint = 'http://127.0.0.1:5000/api/ausencias';
            } else if (type === "Presencial") {
                endpoint = 'http://127.0.0.1:5000/api/presencial';
            }

            axios.post(endpoint, requestData, {
                headers: { Authorization: `Bearer ${userToken}` }
            })
                .then(response => {
                    fetchUserEvents(currentYear, currentMonth); // Atualiza os eventos após criar
                    setSelectedDates([]);
                    console.log(`${type} marcadas com sucesso!`);
                })
                .catch(error => {
                    console.error('Erro ao marcar eventos:', error.response ? error.response.data.error : error);
                    alert(`Erro ao marcar eventos: ${error.response ? error.response.data.error : error.message}. Tente novamente.`);
                });
        }
    };

    // Função para apagar eventos
    const Delete_Event_Fun = () => {
        const userToken = localStorage.getItem('userToken');
        if (selectedDates.length > 0) {
            const dateString = selectedDates[0].toISOString().split('T')[0];
            const event = events.find(event => event.date.toDateString() === selectedDates[0].toDateString())

            if (event) {
                let endpoint = '';
                if (event.title === "Férias") {
                    endpoint = `http://127.0.0.1:5000/api/ferias/${event.id}`;
                } else if (event.title === "Ausência") {
                    endpoint = `http://127.0.0.1:5000/api/ausencias/${event.id}`;
                } else if (event.title === "Presencial") {
                    endpoint = `http://127.0.0.1:5000/api/presencial/${event.id}`;
                }

                axios.delete(endpoint, {
                    headers: { Authorization: `Bearer ${userToken}` }
                })
                    .then(response => {
                        fetchUserEvents(currentYear, currentMonth); // Atualiza os eventos após deletar
                        setSelectedDates([]);
                        console.log('Marcação removida com sucesso!');
                    })
                    .catch(error => {
                        console.error('Erro ao remover marcação:', error.response ? error.response.data.error : error);
                        alert(`Erro ao remover marcação: ${error.response ? error.response.data.error : error.message}. Tente novamente.`);
                    });
            }
        }
    };

    // Função para definir a classe do tile do calendário
    const getTileClassName = ({ date, view }) => {
        if (view === 'month') {
            const selected = selectedDates.some(selectedDate => date.toDateString() === selectedDate.toDateString());
            if (selected) return 'selected';

            const event = events.find(event => event.date.toDateString() === date.toDateString());
            if (event) {
                if (event.title === "Presencial") {
                    return event.status === "approved" ? 'presencial-approved' : 'presencial-pending';
                } else if (event.title === "Férias") {
                    return event.status === "approved" ? 'ferias-approved' : 'ferias-pending';
                } else if (event.title === "Ausência") {
                    return event.status === "approved" ? 'ausencia-approved' : 'ausencia-pending';
                }
            }
        }
        return '';
    };

    // Função para procurar presenças do mês
    const fetchPresencialMes = (ano, mes) => {
        const userToken = localStorage.getItem('userToken');
        axios.get('http://127.0.0.1:5000/api/presencial_mes', {
            headers: { Authorization: `Bearer ${userToken}` },
            params: { ano: ano, mes: mes }
        })
            .then(response => {
                setMetrics(prevMetrics => ({
                    ...prevMetrics,
                    presencialAprovadas: response.data.presenciais_aprovadas,
                    presencialPendentes: response.data.presenciais_pendentes
                }));
            })
            .catch(error => {
                console.error('Erro ao carregar presença do mês:', error);
                alert('Erro ao carregar presença do mês. Tente novamente.');
            });
        axios.get('http://127.0.0.1:5000/api/presencial_obrigatorios', {
            headers: { Authorization: `Bearer ${userToken}` },
            params: { ano: ano, mes: mes }
        })
            .then(response => {
                setMetrics(prevMetrics => ({
                    ...prevMetrics,
                    presencialObrigatorias: response.data.total_presencial
                }));
            })
            .catch(error => {
                console.error('Erro ao carregar presença obrigatória:', error);
                alert('Erro ao carregar presença obrigatória. Tente novamente.');
            });
    };

    // Função para procurar notificações
    const fetchNotificacoes = () => {
        const userToken = localStorage.getItem('userToken');
        fetch(`http://127.0.0.1:5000/api/notificacoes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        })
            .then(response => response.json())
            .then(response => setNotificacoes(response))
            .catch(error => console.error('Erro:', error));
    };

    // Função para apagar uma notificação
    const handleDeleteNotificacao = (id) => {
        const userToken = localStorage.getItem('userToken');
        fetch(`http://127.0.0.1:5000/api/notificacoes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        })
            .then(response => {
                if (response.ok) {
                    setNotificacoes(notificacoes.filter(notificacao => notificacao.id !== id));
                } else {
                    console.error('Erro ao excluir notificação');
                }
            })
            .catch(error => console.error('Erro ao excluir notificação:', error));
    };

    // Função para apagar todas as notificação
    const handleDeleteAllNotificacoes = () => {
        const userToken = localStorage.getItem('userToken');
        fetch(`http://127.0.0.1:5000/api/notificacoes`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        })
            .then(response => {
                if (response.ok) {
                    setNotificacoes([]);
                } else {
                    console.error('Erro ao excluir todas as notificações');
                }
            })
            .catch(error => console.error('Erro ao excluir todas as notificações:', error));
    };

    // Hook useEffect para procurar dados quando o componente é iniciado ou quando o mês/ano atual mudam (acção do utilizador no calendario)
    useEffect(() => {
        fetchUserEvents(currentYear, currentMonth);
        fetchPresencialMes(currentYear, currentMonth);
        fetchNotificacoes();
    }, [currentMonth, currentYear]);

    // Função para capitalizar a primeira letra de uma string
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return (
        <div className="main-container">
            <NavbarColaborador/>
            <div className="container-colaborador">
                <div className="metrics">
                    <h2>Dados de {monthNames[currentMonth - 1]} {currentYear}</h2>
                    <h3>Presencial</h3>
                    <p>Aprovadas: <span id="presencial-aprovadas">{metrics.presencialAprovadas}</span></p>
                    <p>Pendentes: <span id="presencial-pendentes">{metrics.presencialPendentes}</span></p>
                    <p>Obrigatórios: <span id="presencial-obrigatorias">{metrics.presencialObrigatorias}</span></p>
                    <h3>Ausências</h3>
                    <p>Aprovadas: <span id="ausencias-aprovadas">{metrics.ausenciasAprovadas}</span></p>
                    <p>Pendentes: <span id="ausencias-pendentes">{metrics.ausenciasPendentes}</span></p>
                    <h3>Férias</h3>
                    <p>Aprovadas: <span id="ferias-aprovadas">{metrics.feriasAprovadas}</span></p>
                    <p>Pendentes: <span id="ferias-pendentes">{metrics.feriasPendentes}</span></p>
                    <p>Disponiveis: <span id="ferias-por-marcar">{metrics.feriasPorMarcar}</span></p>
                    <br></br>
                    <h2 className="legend-container">Legenda</h2>
                    <ul className="legend-container">
                        <li><span className="legend-presencial-pending"></span> Presencial Pendentes</li>
                        <li><span className="legend-presencial-approved"></span> Presencial Aprovadas</li>
                        <li><span className="legend-ferias-pending"></span> Férias Pendentes</li>
                        <li><span className="legend-ferias-approved"></span> Férias Aprovadas</li>
                        <li><span className="legend-ausencia-pending"></span> Ausência Pendentes</li>
                        <li><span className="legend-ausencia-approved"></span> Ausência Aprovadas</li>
                    </ul>
                </div>
                <div className="legend-container">

                </div>
                <div className="calendar-and-actions">
                    <div className="calendar-container">
                        <Calendar
                            onClickDay={Date_Click_Fun}
                            tileClassName={getTileClassName}
                            selectRange={false}
                            onActiveStartDateChange={({ activeStartDate }) => {
                                setCurrentMonth(activeStartDate.getMonth() + 1);
                                setCurrentYear(activeStartDate.getFullYear());
                            }}
                        />
                    </div>

                    {selectedDates.length === 1 && events.some(event => event.date.toDateString() === selectedDates[0].toDateString()) ? (
                        <div className="button-group">
                            <button onClick={Delete_Event_Fun}>Eliminar Marcação</button>
                        </div>
                    ) : (
                        <div className="button-group">
                            <button className="button-presencial" onClick={() => Create_Event_Fun("Presencial")}>Presencial</button>
                            <button className="button-ferias" onClick={() => Create_Event_Fun("Férias")}>Férias</button>
                            <button className="button-ausencia" onClick={() => Create_Event_Fun("Ausência")}>Ausência</button>
                        </div>
                    )}
                </div>
                <div className="selected-dates">
                    <div className="selected-dates-container">
                        <h2>Dias Selecionados</h2>
                        <ul>
                            {selectedDates.map(date => (
                                <li className="datas-selecionadas" key={date.toDateString()}>{date.toDateString()}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="notifications-container">
                        <h2>Notificações</h2>
                        <button onClick={handleDeleteAllNotificacoes}>Apagar todas as notificações</button>
                        <ul>
                            {notificacoes.map(notificacao => (
                                <li key={notificacao.id}>
                                    {new Date(notificacao.data).toDateString()}: {capitalizeFirstLetter(notificacao.tipo)} - {notificacao.conteudo}
                                    <button onClick={() => handleDeleteNotificacao(notificacao.id)}>X</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
