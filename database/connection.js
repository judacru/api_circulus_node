const mongoose = require("mongoose");

const connection = async() => {
    try {

        await mongoose.connect("mongodb://127.0.0.1:27017/circulus");

        console.log("Conectado correctamente a la base de datos Circulus!!")
    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos");
    }
}

module.exports = connection
