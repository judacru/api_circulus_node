const connection = require("./database/connection")
const express = require("express");
const cors = require("cors");

console.log("API Node para Circulus");

connection();

const app = express();
const port = 3900;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

app.get("/prueba", (req, res) => {
    return res.status(200).json({
        "id": 1,
        "nombre": "Juan"
    });
})



//Crear servidor y escuchar peticiones
app.listen(port, () => {
    console.log("Servidor corriendo en el puerto: ", port)
});
