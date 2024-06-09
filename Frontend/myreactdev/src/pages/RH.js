import React, { useState, useEffect } from "react";
import axios from 'axios';
import Navbarlogado from '../components/NavbarLogado.js';
import '../estilos/NavbarLogado.css';
import '../estilos/RH.css'; // Certifique-se de criar esse arquivo para os estilos

export default function RH() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [allUserEvents, setAllUserEvents] = useState([]);
    const [formattedEvents, setFormattedEvents] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
    const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
    const [selectedTeam, setSelectedTeam] = useState('');
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        fetchAllUserEvents();
        fetchTeams();
    }, [currentMonth, currentYear, selectedTeam]);

    const fetchAllUserEvents = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                console.error("Token JWT não encontrado");
                return;
            }
            let response;
            if (selectedTeam) {
                response = await axios.get(`http://localhost:5000/api/all_users_events_byteam/${selectedTeam}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                response = await axios.get('http://localhost:5000/api/all_users_events', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            setAllUserEvents(response.data);
            formatEvents(response.data);
        } catch (error) {
            console.error("Erro ao obter eventos de todos os usuários:", error.response ? error.response.data : error.message);
        }
    };

    const fetchTeams = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                console.error("Token JWT não encontrado");
                return;
            }
            const response = await axios.get('http://localhost:5000/api/teams', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTeams(response.data);
        } catch (error) {
            console.error("Erro ao obter equipes:", error.response ? error.response.data : error.message);
        }
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

    const handleTeamChange = (event) => {
        setSelectedTeam(event.target.value);
    };

    const generateCSVReport = async (type) => {
        let reportData = [];
        if (type === 'monthly') {
            reportData = formattedEvents.map(userEvents => {
                return {
                    user: `${userEvents.user.primeironome} ${userEvents.user.segundonome}`,
                    ...userEvents.days.reduce((acc, day, index) => {
                        acc[`Dia ${index + 1}`] = day;
                        return acc;
                    }, {})
                };
            });
        } else if (type === 'yearly') {
            try {
                const token = localStorage.getItem('userToken');

                if (!token) {
                    console.error("Token JWT não encontrado");
                    return;
                }
                let response;
                response = await axios.get('http://localhost:5000/api/all_users_events', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                let idselectedTeam;
                for (let t in teams){
                    if (teams[t].nome === selectedTeam){
                        idselectedTeam = teams[t].id;
                    }
                }
                const filteredEvents = idselectedTeam ? response.data.filter(event => event.user.idequipa === idselectedTeam) : response.data;
                const yearlyEvents = filteredEvents.map(userEvents => {
                    const months = Array(12).fill('').map(() => Array(31).fill(''));
                    userEvents.ferias.forEach(event => {
                        const date = new Date(event.data);
                        if (date.getFullYear() === currentYear) {
                            months[date.getMonth()][date.getDate() - 1] = event.estado === 1 ? 'F-P' : 'F';
                        }
                    });
                    userEvents.ausencias.forEach(event => {
                        const date = new Date(event.data);
                        if (date.getFullYear() === currentYear) {
                            months[date.getMonth()][date.getDate() - 1] = event.estado === 1 ? 'A-P' : 'A';
                        }
                    });
                    userEvents.presenciais.forEach(event => {
                        const date = new Date(event.data);
                        if (date.getFullYear() === currentYear) {
                            months[date.getMonth()][date.getDate() - 1] = event.estado === 1 ? 'P-P' : 'P';
                        }
                    });
                    return { user: userEvents.user, months };
                });

                reportData = yearlyEvents.map(userEvents => {
                    const userRow = { user: `${userEvents.user.primeironome} ${userEvents.user.segundonome}` };
                    userEvents.months.forEach((month, monthIndex) => {
                        month.forEach((day, dayIndex) => {
                            const date = new Date(currentYear, monthIndex, dayIndex + 1);
                            userRow[`${String(dayIndex + 1).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}`] = day;
                        });
                    });
                    return userRow;
                });
            } catch (error) {
                console.error("Erro ao obter eventos anuais de todos os usuários:", error.response ? error.response.data : error.message);
                return;
            }
        }

        // Utilize ponto e vírgula como delimitador para compatibilidade com Excel em diferentes configurações regionais
        const csvContent = [
            ["Nome do Colaborador", ...Array.from({ length: type === 'monthly' ? new Date(currentYear, currentMonth + 1, 0).getDate() : 12 * 31 }, (_, i) =>
                type === 'monthly' ? `${String(i + 1).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}` : `${String(i % 31 + 1).padStart(2, '0')}/${String(Math.floor(i / 31) + 1).padStart(2, '0')}`)],
            ...reportData.map(row => [row.user, ...Object.values(row).slice(1)])
        ];

        const csvString = csvContent.map(e => e.join(";")).join("\n");
        const fileName = type === 'monthly' ? `Relatorio_${selectedDate.toLocaleDateString('pt-BR', { month: 'long' })}_${currentYear}.csv` : `Relatório_${currentYear}.csv`;
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
    };

    return (
        <div className="main-container">
            <Navbarlogado />
            <div className="container-RH">
                <div className="month-selector">
                    <button onClick={() => handleYearChange('prev')}>&laquo;</button>
                    <button onClick={() => handleMonthChange('prev')}>&lsaquo;</button>
                    <span>{formatDate(selectedDate)}</span>
                    <button onClick={() => handleMonthChange('next')}>&rsaquo;</button>
                    <button onClick={() => handleYearChange('next')}>&raquo;</button>
                </div>
                <div className="team-selector">
                    <label htmlFor="team">Selecionar Equipa: </label>
                    <select id="team" value={selectedTeam} onChange={handleTeamChange}>
                        <option value="">Todas as Equipas</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.nome}>{team.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="report-buttons">
                    <button onClick={() => generateCSVReport('monthly')}>Gerar Relatório Mensal</button>
                    <button onClick={() => generateCSVReport('yearly')}>Gerar Relatório Anual</button>
                </div>
                <div className="all-users-events">
                    <h2>Situação Atual de Todos os Colaboradores</h2>
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
            </div>
        </div>
    );
}