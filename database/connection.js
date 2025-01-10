const mongoose = require("mongoose");
const config = require("../config/index");

const dbUrl = "mongodb://" + config.DB_SERVER + ":" + config.DB_PORT + "/" + config.DB_NAME;

const connection = async() => {
    try {

        await mongoose.connect(dbUrl);

        console.log("Conectado correctamente a la base de datos Circulus!!")
    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos");
    }
}

module.exports = connection
