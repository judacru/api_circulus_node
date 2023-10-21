const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("../Services/jwt");
const mongoosePaginate = require("mongoose-pagination");
const fs = require("fs").promises;
const path = require("path");
const followService = require("../Services/followService");

const prueba = (req, res) => {
    return res.status(200).json({
        status: "success",
        message: "Hola",
        usuario: req.user
    });
}

const create = async (req, res) => {
    try {
        let params = req.body;

        if (!params.name || !params.nick || !params.email || !params.password) {
            console.log("Validacion incorrecta");
            return res.status(400).json({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        const users = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        });

        if (users && users.length >= 1) {
            return res.status(200).json({
                status: "success",
                message: "El usuario ya existe",
            });
        }

        const pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        let user_to_save = new User(params);

        const userStored = await user_to_save.save();

        return res.status(200).json({
            status: "success",
            message: "Usuario registrado correctamente",
            userStored
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Ocurrió un error",
            error: error.message
        });
    }
}

const login = async (req, res) => {
    try {
        let params = req.body;

        if (!params.email || !params.password) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        const user = await User.findOne({ email: params.email })
        //.select({ "password": 0 })
        if (!user || user.length === 0) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe"
            });
        }

        const pwd = bcrypt.compareSync(params.password, user.password)
        if (!pwd) {
            return res.status(400).send({
                status: "error",
                message: "Contraseña invalida"
            });
        }

        const token = jwt.createToken(user);

        return res.status(200).send({
            status: "success",
            message: "Te has identificado correctamente",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        });
    }
    catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Ocurrió un error",
            error: error.message
        });
    }
}

const profile = async (req, res) => {
    try {
        const id = req.params.id;

        userProfile = await User.findById(id)
            .select({ "password": 0, "role": 0 })
        if (!userProfile || userProfile.length === 0) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe"
            });
        }

        //Informacion de follows

        const followInfo = await followService.followThisUser(req.user.id, id)


        return res.status(200).send({
            status: "success",
            user: userProfile,
            following: followInfo.following,
            follower: followInfo.follower
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Ocurrió un error",
            error: error.message
        });
    }
}

const list = async (req, res) => {
    try {
        let page = 1;
        if (req.params.page) {
            page = parseInt(req.params.page);
        }

        let itemsPerPage = 5;

        const users = await User.find()
            .sort('_id')
            .paginate(page, itemsPerPage);

        const totalUsers = await User.countDocuments({}).exec();

        if (!users || users.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No hay usuarios disponibles"
            });
        }

        //Informacion de follows

        const followInfo = await followService.followUserIds(req.user.id)

        return res.status(200).json({
            status: "success",
            users,
            page,
            itemsPerPage,
            totalUsers,
            pages: Math.ceil(totalUsers / itemsPerPage),
            following: followInfo.following,
            follower: followInfo.followers
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Ocurrió un error",
            error: error.message
        });
    }
};

const update = async (req, res) => {
    try {
        let userIdentity = req.user;
        let userToUpdate = req.body;

        delete userIdentity.iat;
        delete userIdentity.exp;
        delete userIdentity.role;
        delete userIdentity.image;

        const users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        });

        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).json({
                status: "success",
                message: "El usuario ya existe",
            });
        }

        if (userToUpdate.password) {
            const pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }

        userToUpdate = await User.findByIdAndUpdate({_id: userIdentity.id}, userToUpdate, { new: true })

        return res.status(200).json({
            status: "success",
            message: "Usuario actualizado",
            user: userToUpdate
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Ocurrió un error",
            error: error.message
        });
    }
}

const upload = async (req, res) => {
    try {
        if (!req.file) {
            return req.status(400).send({
                status: "error",
                message: "Petición no incluye la imagen"
            })
        }

        let image = req.file.originalname;

        let imageSplit = image.split("\.")
        let extension = imageSplit[1];

        if (extension != "png" && extension != "jpg" && extension != "jpge" && extension != "gif") {
            const filePath = req.file.path;
            fs.unlinkSync(filePath);

            return res.status(400).send({
                status: "error",
                message: "Extensión del fichero invalida"
            })
        }

        userUpdated = await User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })

        return res.status(200).send({
            status: "success",
            user: userUpdated,
            file: req.file,
        })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la subida del avatar",
            error: error.message
        });
    }
}

const avatar = async (req, res) => {
    try {
        const file = req.params.file;
        const filePath = "./uploads/avatars/"+file;

        try {
            await fs.access(filePath);
        } catch (error) {
            return res.status(404).json({
                status: "error",
                message: "La imagen no existe",
            });
        }

        return res.sendFile(path.resolve(filePath));
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al recuperar la imagen",
            error
        });
    }
};


module.exports = {
    create,
    login,
    prueba,
    profile,
    list,
    update,
    upload,
    avatar
}