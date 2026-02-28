const playerController = require('../controllers/playerController');
const player = require('../models/users');

jest.mock('../models/users');

describe('Player Controller', () => {

    let req;
    let res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // ---- Test searchAll ----
    describe('searchAll', () => {
        it('should return all players', async () => {
            const mockPlayers = [{ email: 'a@example.com' }, { email: 'b@example.com' }];
            player.find.mockResolvedValue(mockPlayers);

            await playerController.searchAll(req, res);

            expect(res.json).toHaveBeenCalledWith(mockPlayers);
        });

        it('should handle errors', async () => {
            player.find.mockRejectedValue(new Error('DB error'));

            await playerController.searchAll(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
        });
    });

    // ---- Test searchOne ----
    describe('searchOne', () => {
        it('should return the player with specified email from query params', async () => {
            req.query = { email: 'test@dlsu.edu.ph' };
            const mockPlayer = { email: 'test@dlsu.edu.ph', fullName: 'Test User' };
            player.findOne.mockResolvedValue(mockPlayer);

            await playerController.searchOne(req, res);

            expect(player.findOne).toHaveBeenCalledWith({ email: 'test@dlsu.edu.ph' });
            expect(res.json).toHaveBeenCalledWith({ 
                fullName: 'Test User', 
                email: 'test@dlsu.edu.ph' 
            });
        });

        it('should return the player with specified email from request body', async () => {
            req.body = { email: 'test@dlsu.edu.ph' };
            const mockPlayer = { email: 'test@dlsu.edu.ph', fullName: 'Test User' };
            player.findOne.mockResolvedValue(mockPlayer);

            await playerController.searchOne(req, res);

            expect(player.findOne).toHaveBeenCalledWith({ email: 'test@dlsu.edu.ph' });
            expect(res.json).toHaveBeenCalledWith({ 
                fullName: 'Test User', 
                email: 'test@dlsu.edu.ph' 
            });
        });

        it('should return 400 if no email is provided', async () => {
            req.body = {};
            req.query = {};

            await playerController.searchOne(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Email is required' });
        });

        it('should return 404 if player is not found', async () => {
            req.query = { email: 'nonexistent@example.com' };
            player.findOne.mockResolvedValue(null);

            await playerController.searchOne(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Player not found' });
        });
    });

    // ---- Test addPlayer ----
    describe('addPlayer', () => {
        let originalConsoleLog;
        
        beforeEach(() => {
            originalConsoleLog = console.log;
            console.log = jest.fn();
        });

        afterEach(() => {
            console.log = originalConsoleLog;
        });

        it('should return existing user if found', async () => {
            req.body = { email: 'exist@example.com' };
            const mockPlayer = { email: 'exist@example.com', _id: '123' };
            player.findOne.mockResolvedValue(mockPlayer);

            await playerController.addPlayer(req, res);

            expect(player.findOne).toHaveBeenCalledWith({ email: 'exist@example.com' });
            expect(player.create).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith('User already exists');
        });

        it('should create and return a new user if not exists', async () => {
            req.body = { email: 'new@example.com' };
            const mockNewPlayer = { email: 'new@example.com', _id: '456' };
            player.findOne.mockResolvedValue(null);
            player.create.mockResolvedValue(mockNewPlayer);

            await playerController.addPlayer(req, res);

            expect(player.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
            expect(player.create).toHaveBeenCalledWith({ email: 'new@example.com' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockNewPlayer);
        });

        it('should handle creation error', async () => {
            const error = new Error('Create fail');
            req.body = { email: 'fail@example.com' };
            player.findOne.mockResolvedValue(null);
            player.create.mockRejectedValue(error);

            await playerController.addPlayer(req, res);

            expect(console.log).toHaveBeenCalledWith(error);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Create fail' });
        });
    });

    // ---- Test updateOne ----
    describe('updateOne', () => {
        it('should update and return success message', async () => {
            const mockUser = {
                email: 'update@example.com',
                bio: 'old bio',
                favSports: ['basketball'],
                save: jest.fn().mockResolvedValue(true)
            };
            
            req.body = { 
                email: 'update@example.com',
                bio: 'new bio',
                favSports: ['basketball', 'soccer']
            };
            
            player.findOne.mockResolvedValue(mockUser);
            player.findOneAndUpdate = jest.fn().mockResolvedValue(mockUser);

            await playerController.updateOne(req, res);

            expect(player.findOne).toHaveBeenCalledWith({ email: 'update@example.com' });
            expect(player.findOneAndUpdate).toHaveBeenCalledWith(
                { email: 'update@example.com' },
                { $set: { bio: 'new bio', favSports: ['basketball', 'soccer'] } }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith("Profile Updated");
        });

        it('should return 404 if user not found', async () => {
            req.body = { email: 'missing@example.com' };
            player.findOne.mockResolvedValue(null);

            await playerController.updateOne(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith("Person does not Exist");
        });
    });

    // ---- Test deleteOne ----
    describe('deleteOne', () => {
        it('should delete and return user', async () => {
            req.body = { id: '123' };
            const mockDeleted = { _id: '123', email: 'del@example.com' };
            player.findByIdAndDelete.mockResolvedValue(mockDeleted);

            await playerController.deleteOne(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockDeleted);
        });

        it('should return 404 if user not found', async () => {
            req.body = { id: 'notfound' };
            player.findByIdAndDelete.mockResolvedValue(null);

            await playerController.deleteOne(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'No such user' });
        });

        it('should handle deletion errors', async () => {
            req.body = { id: 'err' };
            player.findByIdAndDelete.mockRejectedValue(new Error('Deletion error'));

            await playerController.deleteOne(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Deletion error' });
        });
    });
});
