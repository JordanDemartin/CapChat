var nb_images_serveur_singulier = -1;
var nb_images_serveur_neutre = -1;
var images = [];
var id_image_solution = "";
var max_time = 35000;
var in_progress = false;

var div_capchat = document.getElementById("div_capchat");
var end_link_capchat = div_capchat.getAttribute("end_link_capchat");
div_capchat.removeAttribute("end_link_capchat");
var auto_redirect_capchat = div_capchat.hasAttribute("auto_redirect_capchat");
var capchat_url = div_capchat.getAttribute("capchat_url");

if(capchat_url.charAt(capchat_url.length-1) != '/'){
    capchat_url += '/';
}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

var compteur;
async function chargerCapChat(){

    let reponse = document.getElementById("reponse");
    reponse.innerText = "cliquez sur l'image décrite ci-dessus";

    in_progress = true;

    images = [];
        
    for(let i = 1; i < 9; i++){
        images.push(document.getElementById("image_"+i));
    }

    let indice = document.getElementById("indice");

    shuffle(images);

    indice_id = Math.floor(Math.random() * nb_images_serveur_singulier)+1;

    let text = await fetch(capchat_url+"indice/"+indice_id).then(data=> data.text());
    indice.innerText = text;

    let image_base64 = "data:image/png;base64,";
    image_base64 += await fetch(capchat_url+"singulier/"+indice_id).then(data=> data.text());
    images[0].setAttribute("src",image_base64);

    let neutre_id = indice_id;
    for(let i = 1; i < 8; i++){
        let image_base64 = "data:image/png;base64,";
        image_base64 += await fetch(capchat_url+"neutre/"+( ((indice_id+i)%nb_images_serveur_neutre)+1 )).then(data=> data.text());
        images[i].setAttribute("src",image_base64);
    }

            
    if(max_time > 10001){
        max_time -= 5000;
    }
    clearTimeout(compteur);
    clearTimeout(window.t);
    setTimer(max_time);
    compteur=setTimeout('chargerCapChat()',max_time);
}

function validerCapChat(event){
    if(in_progress){
        in_progress = false;
        if(event.target.id == images[0].id){
            let reponse = document.getElementById("reponse");
            reponse.innerText = "bonne réponse";
            clearTimeout(compteur);
            clearTimeout(window.t);

            if(end_link_capchat != ""){
                termineCapChat();
            }

        }else{
            let reponse = document.getElementById("reponse");
            reponse.innerText = "mauvaise réponse";
            clearTimeout(compteur);
            clearTimeout(window.t);
        }
    }
}

function termineCapChat(){
    if(auto_redirect_capchat){
        window.location.href = end_link_capchat;
    }else{
        div_capchat = document.getElementById("div_capchat");
        div_capchat.setAttribute("class","cadre-validation");
        div_capchat.innerHTML = "";
    
        let texte_redirection = document.createElement("p");
        texte_redirection.innerText = "CapChat Valide";
    
        div_capchat.appendChild(texte_redirection);
    
        let bouton_redirection = document.createElement("a");
        bouton_redirection.setAttribute("href", end_link_capchat);
        bouton_redirection.innerText = "continuer";
    
        div_capchat.appendChild(bouton_redirection);
    }
}

async function recupereNombreImages(){
    nb_images_serveur_neutre = await fetch(capchat_url+"nombre_neutre").then(data=> data.text());
    nb_images_serveur_singulier = await fetch(capchat_url+"nombre_singulier").then(data=> data.text());
    chargerCapChat();
}

function fillDivCapChat(){

    div_capchat = document.getElementById("div_capchat");
    div_capchat.setAttribute("class", "cadre-global");

    let bouton_reload = document.createElement("input");
    bouton_reload.setAttribute("id","reload");
    bouton_reload.setAttribute("type","button");
    bouton_reload.setAttribute("value","reload");
    bouton_reload.setAttribute("onclick","chargerCapChat()");
    div_capchat.appendChild(bouton_reload);

    let cadre_images = document.createElement("div");
    cadre_images.setAttribute("class","cadre-images");
    cadre_images.setAttribute("height","300");

    let p_indice = document.createElement("p");
    p_indice.setAttribute("id","indice");
    p_indice.innerText = "indice temporaire";
    cadre_images.appendChild(p_indice);

    let p_reponse = document.createElement("p");
    p_reponse.setAttribute("id","reponse");
    p_reponse.innerText = "cliquez sur l'image décrite ci-dessus";
    cadre_images.appendChild(p_reponse);

    for(let i = 1 ; i < 9 ; i++){
        let a_image = document.createElement("a");
        a_image.setAttribute("type","button");
        a_image.setAttribute("id","valider_image_"+i);
        a_image.setAttribute("onclick","validerCapChat(event)");

        let img_image = document.createElement("img");
        img_image.setAttribute("id","image_"+i);
        img_image.setAttribute("class","capchat_image");

        a_image.appendChild(img_image);
        cadre_images.appendChild(a_image);
        if(i==4){
            cadre_images.appendChild(document.createElement("br"));
        }
    }

    div_capchat.appendChild(cadre_images);

    let div_bloc_horloge = document.createElement("div");
    div_bloc_horloge.setAttribute("class","bloc-horloge");

    let canvas_horloge = document.createElement("canvas");
    canvas_horloge.setAttribute("id","horloge");
    canvas_horloge.setAttribute("width","140");
    canvas_horloge.setAttribute("height","700");
    div_bloc_horloge.appendChild(canvas_horloge);

    let div_temps_horloge = document.createElement("div");
    div_temps_horloge.setAttribute("id","temps");
    div_bloc_horloge.appendChild(div_temps_horloge);

    div_capchat.appendChild(div_bloc_horloge);

    let script_horloge = document.createElement("script");
    script_horloge.setAttribute("src","js/horloge.js");
    div_capchat.appendChild(script_horloge);
    recupereNombreImages();

}

fillDivCapChat();