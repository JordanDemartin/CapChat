var http = require('http');
var fileSystem = require('fs');
var formidable = require('formidable');
var path = require('path');
var mysql = require('mysql');
var express = require('express');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var admzip = require('adm-zip');
var rimraf = require("rimraf");
var cors = require("cors");

var app = express();

async function verif_token(req, res){
    let token = req.headers['token'];

    if(token === undefined){
        res.status(400).end("Token manquant");
        return 400;
    }

    let sql = `SELECT id_token from token where token_value = '${token}'`;
    return con.query(sql, function (err, rows, fields) {
        if (err){
            res.status(400).end("La recherche de token a échouée");
            return false;
        }
        if(rows[0] === undefined){
            res.status(400).end("Token invalide");
            return false;
        }
        return true;
    });
}

/*app.use(express.urlencoded({extended: true})); 
app.use(express.json());*/

//partie utilisateur
/*
inscription : post /api/utilisateurs
connexion : get /api/utilisateurs/:identifiant/:mot_de_passe
*/

//inscription
app.post('/api/utilisateurs', function(req, res) {

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {

        if(fields.identifiant === undefined){
            res.status(400).end("identifiant manquant");
            return 400;
        }if(fields.mot_de_passe === undefined){
            res.status(400).end("mot de passe manquant");
            return 400;
        }
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(fields.mot_de_passe, salt, function(err, hash) {

                let sql = `INSERT INTO utilisateur (identifiant, mot_de_passe) VALUES ('${fields.identifiant}', '${hash}')`;
                con.query(sql, function (err) {
                    if (err){
                        res.status(400).end("La création du compte a échouée");
                        return 400;
                    }
                    res.status(200).end("Création réussie");
                });

            });
        });

    });
});

//connexion
app.get('/api/utilisateurs/:identifiant/:mot_de_passe', function(req, res) {

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(req.params.identifiant === undefined){
        res.status(400).end("identifiant manquant");
        return 400;
    }if(req.params.mot_de_passe === undefined){
        res.status(400).end("mot de passe manquant");
        return 400;
    }

    let sql = `SELECT id_utilisateur, mot_de_passe from utilisateur where identifiant = '${req.params.identifiant}'`;
    con.query(sql, function (err, rows, fields) {
        if(err){
            res.status(400).end("Le compte n'as pas été trouvé");
            return 400;
        }
        if(rows.length < 1){
            res.status(400).end("Le compte n'as pas été trouvé");
            return 400;
        }

        let sql = `DELETE from token where id_utilisateur = '${rows[0].id_utilisateur}'`;
        con.query(sql, function (err) {
            if (err){
                res.status(400).end("La suppression de l'ancien token a échouée");
                return 400;
            }
        });

        bcrypt.compare(req.params.mot_de_passe, rows[0].mot_de_passe, function(err, result) {
            if (result) {

                token = crypto.randomBytes(20).toString('hex');
                    
                let sql = `INSERT INTO token (token_value, id_utilisateur) VALUES ('${token}', '${rows[0].id_utilisateur}')`;
                con.query(sql, function (err) {
                    if (err){
                        res.status(400).end("La sauvegarde du token a échouée");
                        return 400;
                    }else{
                        res.status(200).end(JSON.stringify({ token: token }));
                        return 200;
                    }
                });

            }
            else {
                res.status(400).end("Mot de passe invalide");
                return 400;
            }
        });

    });

});

//partie utilisateur

//partie artiste
/*
créer un artiste : post /api/artistes
modifier un artiste : put /api/artiste/:nom_artiste/:nouveau_nom_artiste
supprimer un artiste : delete /api/artistes/:nom_artiste
liste des artistes : get /api/artistes
*/

//créer un artiste
app.post('/api/artistes', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {

        if(fields.nom_artiste === undefined){
            res.status(400).end("nom artiste manquant");
            return 400;
        }

        let sql = `INSERT INTO artiste (nom_artiste) VALUES ('${fields.nom_artiste}')`;
        con.query(sql, function (err) {
            if (err){
                res.status(400).end("La création de l'artiste a échouée");
                return 400;
            }
            res.status(200).end("Création réussie");
        });
    });
});

//modifier artiste
app.put('/api/artistes/:id_artiste/:nouveau_nom_artiste', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let sql = `UPDATE artiste SET nom_artiste='${req.params.nouveau_nom_artiste}' WHERE id_artiste='${req.params.id_artiste}'`;
        con.query(sql, function (err) {
        if (err){
            res.status(400).end("La modification du nom l'artiste a échouée");
            return 400;
        }
        res.status(200).end("Modification réussie");
    });
});

//supprimer un artiste
app.delete('/api/artistes/:id_artiste', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let sql = `DELETE from artiste where id_artiste = '${req.params.id_artiste}'`;
    con.query(sql, function (err) {
        if (err){
            res.status(400).end("La suppression de l'artiste a échouée");
            return 400;
        }
        res.status(200).end("Suppression réussie");
    });
});

//liste des artistes
app.get('/api/artistes', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let sql = "SELECT * from artiste";
    con.query(sql, function (err, results) {
        if (err){
            res.status(400).end("La récupération de la liste des artistes a échouée");
            return 400;
        }
        res.status(200).end(JSON.stringify(results));
    });
});

//partie artiste

//partie theme
/*
créer un theme : post /api/themes
liste des themes : get /api/themes
*/

//créer un theme
app.post('/api/themes', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {

        if(fields.nom_theme === undefined){
            res.status(400).end("nom theme manquant");
            return 400;
        }

        let sql = `INSERT INTO theme (nom_theme) VALUES ('${fields.nom_theme}')`;
        con.query(sql, function (err) {
            if (err){
                res.status(400).end("La création du theme a échouée");
                return 400;
            }
            res.status(200).end("Création réussie");
        });
    });
});

//liste des themes
app.get('/api/themes', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let sql = "SELECT * from theme";
    con.query(sql, function (err, results) {
        if (err){
            res.status(400).end("La récupération de la liste des thèmes a échouée");
            return 400;
        }
        res.status(200).end(JSON.stringify(results));
    });
});

//partie theme

//partie jeu_image
/*
créer un jeu d'images : post /api/jeu_images
modifier un jeu d'images : put /api/jeu_images/:nom_jeu_image/:nouveau_nom_jeu_image/:nouveau_id_theme/:nouveau_id_artiste
supprimer un jeu d'images : delete /api/jeu_image/:nom_jeu_image
liste des jeux d'images : /api/jeu_images
*/

//créer un jeu d'images
app.post('/api/jeux_images', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;
    
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {

        if(fields.nom_jeu_image === undefined){
            res.status(400).end("nom jeu image manquant");
            return 400;
        }
        if(fields.id_theme === undefined){
            res.status(400).end("id theme manquant");
            return 400;
        }
        if(fields.id_theme === undefined){
            res.status(400).end("id artiste manquant");
            return 400;
        }

        let sql = `INSERT INTO jeu_image (nom_jeu_image,id_theme,id_artiste,count_neutre,count_singulier) VALUES ('${fields.nom_jeu_image}', ${fields.id_theme}, ${fields.id_artiste}, 0, 0)`;
        con.query(sql, function (err) {
            if (err){
                res.status(400).end("La création du jeu d'images a échouée");
                return 400;
            }
            res.status(200).end("Création réussie");
        });
    });

});

//modifier un jeu d'images
app.put('/api/jeux_images/:nom_jeu_image/:nouveau_nom_jeu_image/:nouveau_id_theme/:nouveau_id_artiste', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let sql = `UPDATE jeu_image SET nom_jeu_image='${req.params.nouveau_nom_jeu_image}', id_theme='${req.params.nouveau_id_theme}', id_artiste='${req.params.nouveau_id_artiste}'  WHERE nom_jeu_image='${req.params.nom_jeu_image}'`;
    con.query(sql, function (err) {
        if (err){
            res.status(400).end("La modification du jeu d'images a échouée");
            return 400;
        }
        res.status(200).end("Modification réussie");
    });
});

//supprimer un jeu d'images
app.delete('/api/jeux_images/:nom_jeu_image', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    fileSystem.existsSync("./ressources_capchat") || fileSystem.mkdirSync("./ressources_capchat");
    fileSystem.existsSync("./ressources_capchat/"+req.params.nom_jeu_image) || fileSystem.mkdirSync("./ressources_capchat/"+req.params.nom_jeu_image);
    let newpath = path.join("./ressources_capchat","/"+req.params.nom_jeu_image);

    rimraf.sync(newpath);

    let sql = `DELETE from jeu_image where nom_jeu_image = '${req.params.nom_jeu_image}'`;
    con.query(sql, function (err) {
        if (err){
            res.status(400).end("La suppression du jeu d'images a échouée");
            return 400;
        }
        res.status(200).end("Suppression réussie");
    });

});

//liste des jeux d'images
app.get('/api/jeux_images', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let sql = "SELECT * from jeu_image";
    if(req.query.id_artiste != undefined){
        sql += " where id_artiste = " + req.query.id_artiste;
    }else if(req.query.id_theme != undefined){
        sql += " where id_theme = " + req.query.id_theme;
    }

    con.query(sql, function (err, results) {
        if (err){
            res.status(400).end("La récupération de la liste des jeux d'images a échouée");
            return 400;
        }
        for(let i = 0; i < results.length; i++){
            results[i].url_usage = "http://localhost:8080/"+results[i].nom_jeu_image;
        }
        let liste = JSON.stringify(results);
        res.status(200).end(liste);
    });
});

//partie jeu_images

//partie image
/*
ajouter un set image : post /api/set_images
*/

//ajouter un set image
app.post('/api/set_images', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if( files.zipfile === undefined ){
            res.status(400).end("zipfile manquant");
            return 400;
        }
        if( !(fields.set == "neutres" || fields.set == "singuliers") ){
            res.status(400).end("nom de set invalide");
            return 400;
        }
        if( fields.id_jeu_image === undefined ){
            res.status(400).end("id_jeu_image manquant");
            return 400;
        }

        let sql = `SELECT nom_jeu_image from jeu_image join theme on jeu_image.id_theme = theme.id_theme where id_jeu_image = '${fields.id_jeu_image}'`;
        con.query(sql, function (err, rows) {
            if (err){
                res.status(400).end("La reqête à la base de données a échoué");
                return 400;
            }
            if(rows[0].nom_jeu_image === undefined || rows[0].nom_jeu_image == ""){
                res.status(400).end("nom du jeu d'image introuvable");
                return 400;
            }

            let oldpath = files.zipfile.path;
            fileSystem.existsSync("./ressources_capchat") || fileSystem.mkdirSync("./ressources_capchat");
            fileSystem.existsSync("./ressources_capchat/"+rows[0].nom_jeu_image) || fileSystem.mkdirSync("./ressources_capchat/"+rows[0].nom_jeu_image);
            let newpath = path.join("./ressources_capchat","/"+rows[0].nom_jeu_image, "/"+fields.set);
            let newpath_zip = path.join("./ressources_capchat","/"+rows[0].nom_jeu_image, "/"+fields.set+".zip");

            if(fileSystem.existsSync(newpath_zip)){
                fileSystem.unlink(newpath_zip, (err) =>{
                    if (err){
                        res.status(400).end("échec de la suppression de l'ancien zip");
                        return 400;
                    }
                });
            }
            rimraf.sync(newpath);

            fileSystem.rename(oldpath, newpath_zip, function (err) {
                if (err){
                    res.status(400).end("échec de l'upload du zip");
                    return 400;
                }

                var zip = new admzip(newpath_zip);
                zip.extractAllTo(newpath, true);
                fileSystem.unlink(newpath_zip, (err) =>{
                    if (err){
                        res.status(400).end("échec de la suppression du zip");
                        return 400;
                    }
                });
                fileSystem.readdir(newpath, (err, fichiers) => {
                    if(err){
                        res.status(400).end("échec de la lecture du dossier");
                        return 400;
                    }

                    let sql = `UPDATE jeu_image SET count_${fields.set}='${fichiers.length}' WHERE id_jeu_image='${fields.id_jeu_image}'`;
                    con.query(sql, function (err) {
                        if (err){
                            res.status(400).end("La modification du jeu d'images a échouée");
                            return 400;
                        }

                        res.status(200).end("Ajout réussie");
                    });

                });

            });
        });
    });

});

//partie image




//partie indice
/*
ajouter un indice : post /api/indices
modifier un indice : put /api/indices/:id_jeu_image/:text_indice
supprimer un indice : delete /api/indices/:id_indice
liste des indices : get /api/indices
*/

//ajouter un indice
app.post('/api/indices', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {

        if( fields.id_jeu_image === undefined ){
            res.status(400).end("id jeu image manquant");
            return 400;
        }if( fields.text_indice === undefined ){
            res.status(400).end("texte indice manquant");
            return 400;
        }if( fields.numero_image === undefined ){
            res.status(400).end("numero image manquant");
            return 400;
        }

        let sql = `INSERT INTO indice (id_jeu_image, text_indice, numero_image) VALUES (${fields.id_jeu_image}, "${fields.text_indice}", ${fields.numero_image})`;
        con.query(sql, function (err) {
            if (err){
                res.status(400).end("La création de l'indice a échouée");
                return 400;
            }
            res.status(200).end("Création réussie");
        });
    });
});

//modifier un indice
app.put('/api/indices/:id_indice/:text_indice', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let sql = `UPDATE indice SET text_indice='${req.params.text_indice}' WHERE id_indice=${req.params.id_indice}`;
    con.query(sql, function (err) {
        if (err){
            res.status(400).end("La modification du jeu d'images a échouée");
            return 400;
        }
        res.status(200).end("Modification réussie");
    });
});

//supprimer un indice
app.delete('/api/indices/:id_indice', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let sql = `DELETE from indice where id_indice = '${req.params.id_indice}'`;
    con.query(sql, function (err) {
        if (err){
            res.status(400).end("La suppression de l'indice a échouée");
            return 400;
        }
        res.status(200).end("Suppression réussie");
    });
});

//liste des indices
app.get('/api/indices', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");

    if(!verif_token(req, res)) return;

    let sql = "SELECT * from jeu_image";
    if(req.query.id_jeu_image != undefined){
        sql += " where id_jeu_image = " + req.query.id_jeu_image;
    }

    con.query(sql, function (err, results) {
        if (err){
            res.status(400).end("La récupération de la liste des indices");
            return 400;
        }
        res.status(200).end(JSON.stringify(results));
    });
});

//partie indice

app.options('*', cors());

app.use(function(req, res){
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.header("Access-Control-Allow-Origin", "*");
    res.status(404).send('Adresse inconnue :'+req.originalUrl);
});

var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "",
    database: "capchat"
});
con.connect(function(err) {
    if (err){
        throw err;
    }
});

app.listen(8081);