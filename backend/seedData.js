require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./models/users');
const Schedule = require('./models/games');

// for sample data (under test in MongoDB collections)
async function seedDatabase() {
    await mongoose.connect(process.env.MONGODB_URI);

    try {
        const samplePlayers = [
            {
                email: 'audrey_stinson@dlsu.edu.ph',
                fullName: 'Audrey Stinson'
            },            
            {
                email: 'audrey_stinson2@dlsu.edu.ph',
                fullName: 'Audrey Stinson 2'
            },
            {
                email: 'audrey_stinson3@dlsu.edu.ph',
                fullName: 'Audrey Stinson 3'
            },
            {
                email: 'audrey_stinson4@dlsu.edu.ph',
                fullName: 'Audrey Stinson 4'
            }
        ];

        const sampleGames = [
            {
                name: 'Game 1',
                description: 'Game 1 Description',
                sport: 'Basketball',
                date: Date.now(),
                place: 'DLSU Gym',
                memberEmails: ['audrey_stinson@dlsu.edu.ph', 'audrey_stinson2@dlsu.edu.ph'],
                organizerEmail: 'audrey_stinson@dlsu.edu.ph'
            },
            {
                name: 'Game 2',
                description: 'Game 2 Description',
                sport: 'Football',
                date: Date.now(),
                place: 'DLSU Gym 2',
                memberEmails: ['audrey_stinson2@dlsu.edu.ph', 'audrey_stinson3@dlsu.edu.ph'],
                organizerEmail: 'audrey_stinson2@dlsu.edu.ph'
            },
            {
                name: 'Game 3',
                description: 'Game 3 Description',
                sport: 'Volleyball',
                date: Date.now(),
                place: 'DLSU Gym 3',
                memberEmails: ['audrey_stinson@dlsu.edu.ph', 'audrey_stinson4@dlsu.edu.ph', 'audrey_stinson3@dlsu.edu.ph'],
                organizerEmail: 'audrey_stinson@dlsu.edu.ph'
            }
        ];

        await Player.deleteMany({});
        await Schedule.deleteMany({});

        await Player.insertMany(samplePlayers);
        await Schedule.insertMany(sampleGames);

        console.log('Sample data seeded');
    } catch (error) {
        console.error('Error seeding database', error);
    } finally {
        await mongoose.connection.close();
    }
}

seedDatabase();
