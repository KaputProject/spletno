const UserModel = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {isOwner} = require("../utils/authorize");

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.login()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const user = await UserModel.findOne({ username });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET_TOKEN,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            return res.json({
                user: user,
                token: token
            });
        } catch (err) {
            console.log(err)
            return res.status(500).json({ message: 'Server error', error: err });
        }
    },

    /**
     * userController.list()
     */
    list: async function (req, res) {
        try {
            // Returns the users without the password field
            const users = await UserModel.find({}, '-password');

            return res.json(users);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting users.',
                error: err
            });
        }
    },

    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            return res.json(user);
        });
    },

    /**
     * userController.create()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    create: async function (req, res) {
        try {
            const user = new UserModel({
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, 10),
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                identifier: req.body.identifier,
                dateOfBirth: req.body.dateOfBirth
            });

            await user.save();

            return res.status(201).json({
                "message": "User created successfully",
            });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when creating user',
                error: err
            });
        }
    },

    /**
     * userController.update()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    update: async function (req, res) {
        try {
            const id = req.params.id;
            const user = await UserModel.findOne({ _id: id });

            if (!user) {
                return res.status(404).json({ message: 'No such user' });
            }

            user.username = req.body.username || user.username;
            user.name = req.body.name || user.name;
            user.surname = req.body.surname || user.surname;
            user.email = req.body.email || user.email;
            user.identifier = req.body.identifier || user.identifier;
            user.address = req.body.address || user.address;
            user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;

            const updatedUser = await user.save();
            return res.json(updatedUser);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when updating user.',
                error: err
            });
        }
    },

    /**
     * userController.remove()
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    remove: async function (req, res) {
        try {
            const user = await UserModel.findById(req.params.id);

            if (!user) {
                return res.status(404).json({ message: 'No such user' });
            }

            if (!isOwner(user, req.user)) {
                return res.status(403).json({ message: 'Forbidden: No no no no no' });
            }

            await user.deleteOne();

            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({
                message: 'Error when deleting a user.',
                error: err
            });
        }
    }
};
