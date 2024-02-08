const express= require("express");
const fs= require("fs");
const sharp = require("sharp");


app=express();

app.set("view engine","ejs");
console.log("Cale proiect:", __dirname);
app.use("/resurse",express.static(__dirname+"/resurse"));
app.use("/node_modules",express.static(__dirname+"/node_modules"));

obGlobal={
    erori:null,
    imagini:null
}

function createImages(){
    var continutFisier = fs.readFileSync(__dirname + "/resurse/json/galerie.json".toString("utf8"));
    var obiect = JSON.parse(continutFisier);
    var dim_mediu=150;
    var dim_mic=70;
    obGlobal.imagini = obiect.imagini;
    obGlobal.imagini.forEach(function(elem) {
        [numeFisier,extensie] = elem.cale_imagine.split("."); 
        
        if(!fs.existsSync(obiect.cale_galerie+"/mic/")){
            fs.mkdirSync(obiect.cale_galerie+"/mic/");
        
        }

        if(!fs.existsSync(obiect.cale_galerie+"/mediu/")){
            fs.mkdirSync(obiect.cale_galerie+"/mediu/");
        
        }

        elem.cale_imagine = obiect.cale_galerie+"/"+elem.cale_imagine;
        elem.cale_imagine_600 = obiect.cale_galerie+"/mic/"+ numeFisier + ".webp";
        elem.cale_imagine_900 = obiect.cale_galerie+"/mediu/"+ numeFisier + ".webp";
        sharp(__dirname+"/"+elem.cale_imagine).resize(dim_mic).toFile(__dirname+"/"+elem.cale_imagine_600);
        sharp(__dirname+"/"+elem.cale_imagine).resize(dim_mediu).toFile(__dirname+"/"+elem.cale_imagine_900);
    });
    console.log(obGlobal.imagini);
}
createImages();

function createErrors(){
    var continutFisier = fs.readFileSync(__dirname + "/resurse/json/erori.json".toString("utf8"));
    obGlobal.erori = JSON.parse(continutFisier);
}
createErrors();

function renderError(res, identificator, titlu, text, imagine){
    var eroare = obGlobal.erori.info_erori.find(function(elem){
        return elem.identificator == identificator;    
    })

    titlu = titlu || (eroare && eroare.titlu) || (obGlobal.erori.eroare_default.titlu);
    text = text || (eroare && eroare.text) || (obGlobal.erori.eroare_default.text);
    imagine = imagine || (eroare && obGlobal.erori.cale_baza + "/" +eroare.imagine) || (obGlobal.erori.eroare_default.imagine);

    if(eroare && eroare.status){
        res.status(identificator).render("pagini/eroare",{titlu:titlu, text:text , imagine:imagine})
    }
    else{
        res.render("pagini/eroar",{titlu:titlu, text:text , imagine:imagine})
    }
}

app.get(["/","/index","/home"],function(req, res){
    console.log("index");
    res.render("pagini/index",{ip: req.ip, imagini:obGlobal.imagini});
});

app.get("/*.ejs",function(req, res){
    renderError(res,403)
});

app.get("/*",function(req, res){
    console.log("url:",req.url);
    res.render("pagini"+req.url, function(err, rezRandare){
        console.log("Eroare: ", err);
        console.log("Rezulta randare: ",rezRandare);

        if(err)
        {
            if(err.message.includes("Failed to lookup view"))
                renderError(res,404);
            else
                {

                }
        }
        else{
            res.send(rezRandare);
        }

    });
});
console.log("Hello world!");

app.listen(8081);
console.log("Serverul a pornit!");