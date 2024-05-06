import React, { useState } from "react";
import { Link } from 'react-router-dom';
import NavbarColaborador from '../components/NavbarColaborador';
import '../estilos/Colaborador.css';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function Colaborador() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventName, setEventName] = useState("");
    const [events, setEvents] = useState([]);

    const Date_Click_Fun = (date) => {
        setSelectedDate(date);
    };

    const Event_Data_Update = (event) => {
        setEventName(event.target.value);
    };

    const Create_Event_Fun = () => {
        if (selectedDate && eventName) {
            const newEvent = {
                id: new Date().getTime(),
                date: selectedDate,
                title: eventName,
            };
            setEvents([...events, newEvent]);
            // setSelectedDate(null);
            setEventName("");
            // setSelectedDate(newEvent.date);
        }
    };

    const Update_Event_Fun = (eventId, newName) => {
        const updated_Events = events.map((event) => {
            if (event.id === eventId) {
                return {
                    ...event,
                    title: newName,
                };
            }
            return event;
        });
        setEvents(updated_Events);
    };

    const Delete_Event_Fun = (eventId) => {
        const updated_Events = events.filter((event) => event.id !== eventId);
        setEvents(updated_Events);
    };
    return (
        <div className="main-container">
            <NavbarColaborador/>
            <div className="container-colaborador">
                <div className="metrics">
                    <h3>Presencial</h3>
                    <p>Aprovadas: <span id="presencial-aprovadas">0</span></p>
                    <p>Pendentes: <span id="presencial-pendentes">0</span></p>
                    <p>Obrigatórias: <span id="presencial-obrigatorias">0</span></p>
                    <h3>Ausências</h3>
                    <p>Aprovadas: <span id="ausencias-aprovadas">0</span></p>
                    <p>Pendentes: <span id="ausencias-pendentes">0</span></p>
                    <h3>Férias</h3>
                    <p>Aprovadas: <span id="ferias-aprovadas">0</span></p>
                    <p>Pendentes: <span id="ferias-pendentes">0</span></p>
                    <p>Por Marcar: <span id="ferias-por-marcar">0</span></p>
                </div>
                <div className="calendar-container">
                    <Calendar
                        value={selectedDate}
                        onClickDay={Date_Click_Fun}
                        tileClassName={({date, view}) => {
                            if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                                return 'selected';
                            } else if (events.some(event => event.date.toDateString() === date.toDateString())) {
                                return 'event-marked';
                            }
                            return '';
                        }}
                    />
                    {selectedDate && (
                        <div className="event-form">
                            <h2>Create Event</h2>
                            <p>Selected Date: {selectedDate.toDateString()}</p>
                            <input
                                type="text"
                                placeholder="Event Name"
                                value={eventName}
                                onChange={Event_Data_Update}
                            />
                            <button
                                className="create-btn"
                                onClick={Create_Event_Fun}
                            >
                                Click Here to Add Event
                            </button>
                        </div>
                    )}
                    {events.length > 0 && (
                        <div className="event-list">
                            <h2>My Created Event List</h2>
                            <div className="event-cards">
                                {events.map((event) =>
                                    event.date.toDateString() === selectedDate.toDateString() ? (
                                        <div key={event.id} className="event-card">
                                            <div className="event-card-header">
                                                <span className="event-date">{event.date.toDateString()}</span>
                                                <div className="event-actions">
                                                    <button
                                                        className="update-btn"
                                                        onClick={() => Update_Event_Fun(event.id, prompt("ENTER NEW TITLE"))}
                                                    >
                                                        Update Event
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => Delete_Event_Fun(event.id)}
                                                    >
                                                        Delete Event
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="event-card-body">
                                                <p className="event-title">{event.title}</p>
                                            </div>
                                        </div>
                                    ) : null
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}