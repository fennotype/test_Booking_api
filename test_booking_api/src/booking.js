import React, { useState, useEffect } from 'react';

const Booking = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [userName, setUserName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoadingEvents(true);
        try {
            const response = await fetch('http://localhost:5000/api/events');
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Ошибка загрузки мероприятий:', error);
            setMessage(' Ошибка загрузки мероприятий');
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/bookings/reserve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_id: selectedEvent.id,
                    user_id: userName
                })
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Вы успешно записались');
                setShowForm(false);
            } else {
                setMessage(`${data.message || data.error || 'Произошла ошибка'}`);
            }
        } catch (error) {
            setMessage('Ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-container">
            <h1>Запись на мероприятия</h1>

            {loadingEvents ? (
                <div>Загрузка...</div>
            ) : (
                <div className="events-grid">
                    {events.map((event) => (
                        <div key={event.id} className="event-card">
                            <h3>{event.name}</h3>
                            <button
                                className="select-button"
                                onClick={() => {
                                    setSelectedEvent(event);
                                    setShowForm(true);
                                }}
                            >
                                Выбрать
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showForm && selectedEvent && (
                <div className="form-container">
                    <h2>Запись на {selectedEvent.name}</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Введите ваше ФИО"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading || !userName.trim()}
                        >
                            {loading ? 'Отправка...' : 'Записаться'}
                        </button>
                    </form>
                    <button onClick={() => setShowForm(false)}>Отмена</button>
                </div>
            )}

            {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default Booking;