var http = require('http');
var fileSystem = require('fs');
var path = require('path');
var express = require('express');
var mysql = require('mysql');

var app = express();

function base64_encode(file) {
  var bitmap = fileSystem.readFileSync(file);
  return Buffer.from(bitmap).toString('base64');
}

app.get('/:collection/singulier/:id', function(req, res) {
  try{
    res.setHeader('Access-Control-Allow-Origin', '*');
    let chemin = path.join("./ressources_capchat","/"+req.params.collection, "/singuliers/", req.params.id+'.jpg');
    let base64_image = base64_encode(chemin);
    res.end(base64_image);
  }catch(error){
    if(error.errno == "-4058"){
      res.end("collection inconnue");
    }else{
      res.end("unknown error");
    }
  }
});

app.get('/:collection/neutre/:id', function(req, res) {
  try{
    res.setHeader('Access-Control-Allow-Origin', '*');
    let chemin = path.join("./ressources_capchat","/"+req.params.collection, "/neutres/", req.params.id+'.jpg');
    let base64_image = base64_encode(chemin);
    res.end(base64_image);
  }catch(error){
    if(error.errno == "-4058"){
      res.end("collection inconnue");
    }else{
      res.end("unknown error");
    }
  }
});

app.get('/:collection/nombre_neutre', function(req, res) {

  let sql = `SELECT count_neutres from jeu_image where nom_jeu_image = "${req.params.collection}"`;

  con.query(sql, function (err, rows) {
    if (err){
      res.status(400).end("La récupération du nombre de neutres a échouée");
      return 400;
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(`${rows[0].count_neutres}`);
  });

});

app.get('/:collection/nombre_singulier', function(req, res) {

  let sql = `SELECT count_singuliers from jeu_image where nom_jeu_image = "${req.params.collection}"`;

  con.query(sql, function (err, rows) {
    if (err){
      res.status(400).end("La récupération du nombre de neutres a échouée");
      return 400;
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(`${rows[0].count_singuliers}`);
  });

});

app.get('/:collection/indice/:id', function(req, res) {

  let sql = `SELECT indice.text_indice from jeu_image join indice on jeu_image.id_jeu_image = indice.id_jeu_image where jeu_image.nom_jeu_image = "${req.params.collection}" and indice.numero_image = "${req.params.id}"`;

  con.query(sql, function (err, rows) {
    if (err){
      res.status(400).end("La récupération de l'indice a échouée");
      return 400;
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader('Access-Control-Allow-Origin', '*');
    if(!(rows[0] === undefined)){
      res.end(rows[0].text_indice);
      return 200;
    }
    res.end("Aucun indice");
    return 200;
  });

});

app.use(function(req, res){
  res.setHeader("Content-Type", "application/json; charset=utf-8");
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

app.listen(8080);