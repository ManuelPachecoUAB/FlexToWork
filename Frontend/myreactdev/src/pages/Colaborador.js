import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import NavbarColaborador from '../components/NavbarLogado.js';
import '../estilos/Colaborador.css';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from 'axios';

export default function Colaborador() {
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
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

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
                console.error('Erro ao carregar eventos do usuário:', error);
                alert('Erro ao carregar eventos do usuário. Tente novamente.');
            });
    };


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

    const getTileClassName = ({ date, view }) => {
        if (view === 'month') {
            const selected = selectedDates.some(selectedDate => date.toDateString() === selectedDate.toDateString());
            if (selected) return 'selected';

            const event = events.find(event => event.date.toDateString() === date.toDateString());
            if (event) {
                if (event.title === "Presencial") {
                    return event.status === "approved" ? 'home-office-approved' : 'home-office-pending';
                } else if (event.title === "Férias") {
                    return event.status === "approved" ? 'ferias-approved' : 'ferias-pending';
                } else if (event.title === "Ausência") {
                    return event.status === "approved" ? 'ausencia-approved' : 'ausencia-pending';
                }
            }
        }
        return '';
    };

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

    useEffect(() => {
        fetchUserEvents(currentYear, currentMonth);
        fetchPresencialMes(currentYear, currentMonth);
    }, [currentMonth, currentYear]);

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
                <div className="selected-dates-container">
                    <h2>Dias Selecionados</h2>
                    <ul>
                        {selectedDates.map(date => (
                            <li className="datas-selecionadas" key={date.toDateString()}>{date.toDateString()}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
