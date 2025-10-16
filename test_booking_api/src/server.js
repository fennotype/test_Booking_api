const express = require('express');
const app = express()
const pool = require('./db.js')
const cors = require('cors')
const port = 5000
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}))

app.get('/api/events', async (req, res) => {
    try {
        const response = await pool.query('SELECT * FROM events')
        res.json(response.rows)
    } catch (error) {
        return res.status(500).json({ error: 'ошибка загрузки данных о мероприятиях' })
    }
})



app.post('/api/bookings/reserve', async (req, res) => {
    console.log(req.body)   //не забыть убрать
    const { event_id, user_id } = req.body
    if (!event_id || !user_id) {
        return res.status(400).json({ message: `Пожалуйста заполните все поля` })
    }

    try {
        const user_exist = await pool.query(
            'SELECT * FROM bookings WHERE event_id = $1 AND user_id = $2', [event_id, user_id])
        if (user_exist.rows.length > 0) {
            return res.status(400).json({ error: 'Вы уже записались на данное мерроприятие' })
        }
        await pool.query('INSERT INTO bookings (event_id, user_id) VALUES($1, $2)', [event_id, user_id])
        return res.status(201).json({ error: 'Вы записалий на мероприятие' })

    } catch (error) {
        console.error('что-то сделало бум')    //не забыть убрать 
        return res.status(500).json({ error: 'произошла ошибка при регистрации, пожалуйста попробуйте позднее' })
    }
})


app.listen(port, () => {
    console.log(`http://localhost:5000/api/events'`)
})