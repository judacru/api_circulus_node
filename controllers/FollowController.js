const Follow = require("../models/follow");
const User = require("../models/user");

const mongoosePaginate = require("mongoose-pagination");

const followService = require("../Services/followService");

const prueba = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador de usuarios"
    });
}

const save = async (req, res) => {
    try {
        const params = req.body;
        const identity = req.user;

        findFollow = await Follow.find({
            "user": identity.id,
            "followed": params.followed
        })

        if (findFollow.length > 0) {
            return res.status(400).send({
                status: "error",
                message: "Ya esta siguiendo al usuario",
            });
        }

        let userToFollow = new Follow({
            user: identity.id,
            followed: params.followed
        })

        followStored = await userToFollow.save()

        return res.status(200).send({
            status: "success",
            message: "Usuario seguido con éxito",
            followStored
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Error al seguir al usuario",
        });
    }
}

const unfollow = async (req, res) => {
    try {
        const userId = req.user.id;
        const followedId = req.params.id;

        const followDeleted = await Follow.deleteOne({
            "user": userId,
            "followed": followedId
        });

        if (followDeleted.deletedCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró el seguimiento o ya se ha eliminado anteriormente.",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Has dejado de seguir al usuario.",
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al dejar de seguir al usuario.",
            error,
        });
    }
};

const following = async (req, res) => {
    try {
        let idUser = req.user.id;

        if (req.params.id) idUser = req.params.id;

        let page = 1;

        if (req.params.page) page = parseInt(req.params.page);

        const itemsPerPage = 2;
        
        const following = await Follow.find({ "user": idUser })
            .populate("user followed", "-password -role -__v")
            .paginate(page, itemsPerPage)

        const total = await Follow.countDocuments({ "user": idUser }).exec();

        let followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).json({
            status: "success",
            message: "Listado de usuarios que estoy siguiendo.",
            following,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al buscar los usuarios.",
            error,
        });
    }
};

const followers = async (req, res) => {
    try {
        let idUser = req.user.id;

        if (req.params.id) idUser = req.params.id;

        let page = 1;

        if (req.params.page) page = parseInt(req.params.page);

        const itemsPerPage = 2;

        console.log(idUser)

        const follows = await Follow.find({ "followed": idUser })
            .populate("user", "-password -role -__v")
            .paginate(page, itemsPerPage)

        const total = await Follow.countDocuments({ "user": idUser }).exec();

        let followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).json({
            status: "success",
            message: "Listado de usuarios que me siguen.",
            follows,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al buscar los usuarios.",
            error,
        });
    }
};


module.exports = {
    prueba,
    save,
    unfollow,
    following,
    followers
}