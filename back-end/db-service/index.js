// index.js

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./db');

const Room = require('./models/Room');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const http = require('http').Server(app);

const { Kafka } = require('kafkajs');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChatApp API',
      version: '1.0.0',
    },
  },
  apis: ['./swagger.yaml'], // Specify the files containing your API definitions
};

const specs = swaggerJsdoc(options);

// Initialize Middleware
app.use(express.json({ extended: false }));
app.use(cors()); // This line enables CORS for all origins
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');
    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const broadcast = (message) => {
    try {
        io.emit('message', { message: message });
        console.log('broadcast message sent...');
    } catch (err) {
        console.error(err.message);
    }
};

// Create a Kafka producer instance
const kafka = new Kafka({
    clientId: 'chat-app', // Replace with a unique client ID
    brokers: ['localhost:9092'] // Replace with your Kafka broker address
  });

const publishNewMessage = async (message) => {
    // Send message to Kafka topic
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'chat-messages', // Replace with your Kafka topic name
      messages: [
        { value: JSON.stringify({ type: 'new_message', data: message }) },
      ],
    });
    console.log('message published to message broker');
    await producer.disconnect();

    const consumer = kafka.consumer({ groupId: 'chat-app-consumer' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'chat-messages', fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ message }) => {
            console.log('message consumed from message broker');
            broadcast(message);
        }
    });
};

// const kafkaConsumer = kafka.consumer({
//     groupId: 'chat-app-consumer', // Replace with a unique group ID
//     brokers: ['localhost:9092'] // Replace with your Kafka broker address
// });
  
// kafkaConsumer.on('ready', () => {
//     console.log('Kafka consumer connected');
//     kafkaConsumer.subscribe(['chat-messages'], (err) => {
//         if (err) {
//             console.error('Error subscribing to topic:', err);
//         } else {
//             console.log('Subscribed to topic: chat-messages');
//         }
//     });
// });
  
// kafkaConsumer.on('message', (message) => {
//     console.log('message consumed from message broker');
//     broadcast(message);
// });

// kafkaConsumer.on('error', (err) => {
//     console.error('Kafka consumer error:', err);
// });

// Connect to MongoDB Database
connectDB().then(async () => {
    console.log('Starting Database seeding operation.');
    const roomCount = await Room.countDocuments();
    if (!roomCount) {
        const roomData = [
            {
                rid: '46b08a9e-1bb9-465b-85d8-6bb7c69b5385',
                name: 'General',
                active: true
            }
        ];
        for (const item of roomData) {
            await Room.create(item);
            console.log('New Room Added.');
        }
    }
    console.log('Database seeded successfully.');
});

// Define Routes
app.get('/', (req, res) => res.send('API Running'));

// Get all rooms
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// Get all messages
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// Get a single room
app.get('/api/rooms/:rid', async (req, res) => {
    try {
        const room = await Room.findOne({ rid: req.params.rid }); // Search by 'rid' field
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }
        res.json(room);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// Get a single user
app.get('/api/users/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid }); // Search by 'uid' field
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// Get a single message
app.get('/api/messages/:mid', async (req, res) => {
    try {
        const message = await Message.findOne({ mid: req.params.mid }); // Search by 'mid' field
        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }
        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// Create a room
app.post('/api/rooms', async (req, res) => {
    const { rid, name, active } = req.body;

    try {
        const room = new Room({
            rid,
            name,
            active
        });
        const savedRoom = await room.save();
        broadcast(JSON.stringify({ type: 'new_room', data: room }));
        res.json(savedRoom);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a user
app.post('/api/users', async (req, res) => {
    const { uid, name, email, color, active } = req.body;

    try {
        const user = new User({
            uid,
            name,
            email,
            color,
            active
        });
        const savedUser = await user.save();
        broadcast(JSON.stringify({ type: 'new_user', data: user }));
        res.json(savedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a message
app.post('/api/messages', async (req, res) => {
    const { mid, content, sender, room } = req.body;

    try {
        const message = new Message({
            mid,
            content,
            sender,
            room
        });
        const savedMessage = await message.save();
        // Publish new message event to RabbitMQ
        await publishNewMessage(message);
        //broadcast(JSON.stringify({ type: 'new_message', data: message }));
        res.json(savedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a room
app.put('/api/rooms/:rid', async (req, res) => {
    const { name, active } = req.body;

    try {
        const room = await Room.findOneAndUpdate(
            { rid: req.params.rid }, // Query by rid
            { name, active },
            { new: true }
        );

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        res.json(room);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a user
app.put('/api/users/:uid', async (req, res) => {
    const { name, email, color, active } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { uid: req.params.uid }, // Query by uid
            { name, email, color, active },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a message
app.put('/api/messages/:mid', async (req, res) => {
    const { content, sender, room } = req.body;

    try {
        const message = await Message.findOneAndUpdate(
            { mid: req.params.mid }, // Query by mid
            { content, sender, room },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a room
app.delete('/api/rooms/:rid', async (req, res) => {
    try {
        const room = await Room.findOneAndDelete({ rid: req.params.rid }); // Query by rid

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        res.json({ msg: 'Room removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// Delete a user
app.delete('/api/users/:uid', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ uid: req.params.uid }); // Query by uid

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// Delete a message
app.delete('/api/messages/:mid', async (req, res) => {
    try {
        const message = await Message.findOneAndDelete({ mid: req.params.mid }); // Query by mid

        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        res.json({ msg: 'Message removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

const WEBPORT = 5000;
const SOCKETPORT = 7000;

http.listen(SOCKETPORT, () => console.log(`Server listening on ${SOCKETPORT}`));
app.listen(WEBPORT, () => console.log(`Server started on port ${WEBPORT}`));
