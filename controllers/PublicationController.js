const fs = require("fs").promises;
const path = require("path");
const Publication = require("../models/publication");
const followService = require("../Services/followService");


const save = async (req, res) => {
    try {
        const params = req.body;

        if (!params.text) {
            return res.status(400).send({
                status: "error",
                message: "Debes enviar el texto de la publicacion",
            });
        }

        let newPublication = new Publication(params);
        newPublication.user = req.user.id;

        const publicationStore = await newPublication.save();

        return res.status(200).send({
            status: "success",
            message: "Publicación guardada con éxito",
            publicationStore
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Error al guardar la publicación",
        });
    }
};

const detail = async (req, res) => {
    try {
        const publicationId = req.params.id;

        const publicationStore = await Publication.findById({ "_id": publicationId })

        if (!publicationStore) {
            return res.status(400).send({
                status: "error",
                message: "No existe la publicación",
            });
        }

        return res.status(200).send({
            status: "success",
            publicationStore
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Error al buscar la publicación",
            error
        });
    }
}

const remove = async (req, res) => {
    try {
        const publicationId = req.params.id;

        const publicationDeleted = await Publication.deleteOne({ "user": req.user.id, "_id": publicationId })
        if (publicationDeleted.deletedCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró la publicación o ya se ha eliminado anteriormente.",
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Publicacion eliminada con exito.",
            publicationId
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Error al buscar la publicación",
            error
        });
    }
}

const user = async (req, res) => {
    try {
        const userId = req.params.id;

        let page = 1;

        if (req.params.page) page = parseInt(req.params.page);

        const itemsPerPage = 2;

        const publications = await Publication.find({ "user": userId })
            .sort("-created_at")
            .populate("user", "-password -__v -role")
            .paginate(page, itemsPerPage)

        if (publications.length === 0) {
            return res.status(400).send({
                status: "error",
                message: "No hay publicaciones para mostrar",
            });
        }

        const total = await Publication.countDocuments({ "user": userId }).exec();

        return res.status(200).send({
            status: "success",
            message: "Publicaciones del perfil de Juan.",
            publications,
            page,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Error al buscar las publicación",
            error
        });
    }
}

const upload = async (req, res) => {
    try {
        const publicationId = req.params.id; 

        if (!req.file) {
            return res.status(400).send({
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

        publicationUpdated = await Publication.findOneAndUpdate({ "user": req.user.id, "_id": publicationId }, { file: req.file.filename }, { new: true })

        return res.status(200).send({
            status: "success",
            user: publicationUpdated,
            file: req.file,
        })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la subida de la imagen",
            error: error.message
        });
    }
}

const media = async (req, res) => {
    try {
        const file = req.params.file;
        const filePath = "./uploads/publications/"+file;

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

const feed = async (req, res) => {

    let page = 1;

    if(req.params.page) page = req.params.page;

    let itemsPerPage = 5

    try{
        const myFollows = await followService.followUserIds(req.user.id);

        const publications = await Publication.find({
            user: myFollows.following
        })
        return res.status(200).send({
            status: "success",
            message: "Feed de publicaciones",
            following: myFollows.following,
            publications
        })
    }catch (error) {
        return res.status(500).json({
            status: "error",
            message: "No se han listado las publicaciones del feed",
            error
        });
    }
}

module.exports = {
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}