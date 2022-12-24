

/**
 * Valida el formulario de envío de mensajes antes de proceder a
 * su envío. En caso de error, se muestra una alerta.
 *
 * NOTA: Primera versión de la validación vía JS.
 */
function validateMessage() {
    var msj = document.forms["home"]["message"]
    var retorno = true

    document.forms["home"]["friend_copy"].value = $('select[name="friend"]').val()
    if ((msj.value.trim().length == 0) || (msj.value.trim().length > 128)) {
        alert("The message cannot be empty and must have less than 128 characters")
        msj.focus()
        retorno = false
    }

    return (retorno)
}

/**
 * Valida el formulario de envío de mensajes antes de proceder a
 * su envío. En caso de error, el mensaje de error se muestra
 * integrado en el documento.
 *
 * NOTA: Versión de la validación vía JS tras estudiar DHTML.
 */
function validateMessageDHTML() {
    var msj = document.forms["home"]["message"]
    var errores = ""
    var retorno = true

    if ((msj.value.trim().length == 0) || (msj.value.trim().length > 128)) {
        errores += "el mensaje no puede tener menos de  128 caracteres"
        msj.className = "inputError"
        msj.focus()
        retorno = false
    }
    else {
        msj.className = ""
    }

    if (!retorno) {
        document.getElementById("errores_home").innerHTML = errores
        document.getElementById("errores_home").style.display = "block"
    }
    else {
        // Si el mensaje es válido también se manda el amigo del que se están viendo
        // los mensajes. Si no se hiciera esto, cada vez que se mandara un mensaje
        // nuevo se mostrarían los mensajes de todos los amigos
        $('input#friend_copy').val($('select[name=friend]').val())
    }

    return (retorno)
}

/**
  * Obtiene el listado de mensajes del usuario seleccionado mediante una llamada AJAX
  *
  * NOTA: El contenido del panel de mensajes se construye creando nuevos elementos HTML (comparar con la función
  * showFriends).
  */
function updateFriendMessages(select_friend) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if ((this.readyState == 4) && (this.status == 200)) {

            var datos = JSON.parse(this.responseText);

            contenedorMsjs = document.getElementById('messages');
            hola = db.session.query().all
            console.log(hola)
            // Se dejan de mostrar los mensajes anteriores ...
            contenedorMsjs.innerHTML = "";
            // ... se añaden uno a uno los mensajes recibidos en la petición AJAX ...
            datos.forEach(function (item) {
                contenedorMsjs.innerHTML += "<li>" + item[0] + ": " + item[1] + ":" + item[2];
            })
            // ... y finalmente se actualiza la etiqueta con el nombre del amigo del que se están viendo los
            // mensajes
            document.getElementById("selected_friend").innerHTML = select_friend.value;
        }
    };
    xmlhttp.open("POST", "/friend_messages", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("friend=" + select_friend.value);
}

/**
 * Obtiene el listado de mensajes del usuario seleccionado mediante una llamada jQuery
 *
 * NOTA: Esta función es equivalente a la anterior, con la diferencia que para hacer la llamada AJAX se utiliza jQuery
 * en lugar del objeto XMLHttpRequest
 */
function updateFriendMessagesJQUERY() {
    $.post("/friend_messages",
        "friend=" + $('select[name="friend"]').val(),
        function (data) {
            $('#messages').empty();
            data.forEach(function (item) {
                //$('<h3 class="text-3xl text-gray-800">'   ).appendTo('#messages').text(item[0] + ": " + item[1] + " " + item[2])
                //$("#messages").append("<div>"+  "<img src=\"{{url_for(\'static\',filename=\'pic_post/"+item[2]+"\')}}\""+">"+ "</div>" )
                //$("#messages").append('<img src="/static/pic_post/'+item[2]+'"/>');
                if (item[3] != "" && item[2] != "") {
                    $("#messages").append("<div class=\"scroll-object\">" + "<div class=\"shadow-xl  bg-white max-w-xl  rounded-lg shadow-cla-blue bg-white overflow-hidden\"   >" + '<img class="w-10 h-10 rounded-full" alt=\"a\" src="/static/pic_post/' + item[3] + '"/>' + "<div class=\"mx-3 mb-2 px-2 text-lg font-semibold text-gray-600 text-blue-700  px-2 \">" + item[0] + ":" + "<div/>" + "<div class=\"mx-3 mb-2 px-2 text-lg font-Opensans text-gray-600\">" + item[1] + "<div/>" + '<img class=\"rounded-lg\" alt=\"a\" src="/static/pic_post/' + item[2] + '"/>' + "<div/>" + "</div>")
                } else {
                    if (item[2] != "") {
                        $("#messages").append("<div class=\"scroll-object\">" + "<div class=\"shadow-xl  bg-white max-w-xl  rounded-lg shadow-cla-blue bg-white overflow-hidden\"   >" + '<img class="w-10 h-10 rounded-full" alt=\"a\" src="/static/pic_post/default_profile_pic.png"/>' + "<div class=\"mx-3 mb-2 px-2 text-lg font-semibold text-gray-600 text-blue-700  px-2 \">" + item[0] + ":" + "<div/>" + "<div class=\"mx-3 mb-2 px-2 text-lg font-Opensans text-gray-600\">" + item[1] + "<div/>" + '<img class=\"rounded-lg\" alt=\"a\" src="/static/pic_post/' + item[2] + '"/>' + "<div/>" + "</div>")
                    } else {
                        if (item[3] == "" && item[2] != "") {
                            $("#messages").append("<div class=\"scroll-object \">" + "<div class=\"shadow-xl  bg-white max-w-xl  rounded-lg shadow-cla-blue bg-white overflow-hidden\">" + " <div class=\"mx-3 mt-2 flex flex-row px-2 py-3\">" + '<img class="w-10 h-10 rounded-full" alt=\"a\" src="/static/images/' + item[3] + '"/>' + "<div class=\" text-lg font-semibold text-gray-600 text-blue-700  px-2\">" + item[0] + ":" + "<div/>" + "<div/>" + "<div class=\"mx-3 mb-2 px-2 text-lg font-Opensans text-gray-600\">" + item[1] + "<div/>" + "<div/>" + "<div/>" + "</div>")
                        } else {

                            $("#messages").append("<div class=\"scroll-object \">" + "<div class=\"shadow-xl  bg-white max-w-xl  rounded-lg shadow-cla-blue bg-white overflow-hidden\">" + " <div class=\"mx-3 mt-2 flex flex-row px-2 py-3\">" + '<img class="w-10 h-10 rounded-full" alt=\"a\" src="/static/images/default_profile_pic.png' + '"/>' + "<div class=\" text-lg font-semibold text-gray-600 text-blue-700  px-2 \">" + item[0] + ":" + "<div/>" + "<div class=\"mx-3 mb-2 px-2 text-lg font-Opensans text-gray-600\">" + item[1] + "<div/>" + "</div>")
                        }

                    }
                }


                //<img src=" {{ url_for('static', filename='pic_post/'+Post.photo)}}" align="right">


            })
            $('#selected_friend').text($('select[name="friend"]').val())
        }, "json");
}

/**
 * Obtiene el listado de amigos mediante una petición AJAX.
 *
 * NOTA: El contenido del panel de amigos se construye generando un fragmento de código HTML (comparar con la
 * función updateFriendMessages).
 */
function showFriends() {
    $("#div_messages").hide()
    $.getJSON("/friends",
        function (data) {
            var i = 1;
            $('#friends').empty();
            $('#friends').append("<div class='par' id='t0'>" +
                "<input id='check0' value='All' type='checkbox' onclick='pulsadoCheck(0)' />Todos</div>")
            data.forEach(function (item) {
                $('#friends').append("<div class='" + ((i % 2) ? "impar" : "par") + "' id='t" + i + "'>" +
                    "<input clas=\"my-auto transform scale-125\" id='check" + i + "' value='" + item + "' type='checkbox' onclick='pulsadoCheck(" + i + ")' />" +
                    item + "</div>")
                i++
            });
            $("#div_friends").show()
        });
}

// Funcionalidad adaptada del código de ejemplo para la selección única de amigos
var seleccionados = new Array();

function desmarcarSeleccionados() {
    while (seleccionados.length != 0) {
        var item = seleccionados.pop();
        item.click();
    }
}

function pulsadoCheck(id) {
    if (document.getElementById("check" + id).checked) {
        document.getElementById("t" + id).className += " seleccionado";
        document.getElementById("t" + id).style.fontWeight = "Poppins";
        document.getElementById("t" + id).style.fontStyle = "Poppins";

        desmarcarSeleccionados();

        seleccionados.push(document.getElementById("check" + id));
    }
    else {
        var clase = document.getElementById("t" + id).className;
        var i;

        document.getElementById("t" + id).className = clase.substr(0, clase.indexOf(" seleccionado"));
        document.getElementById("t" + id).style.fontWeight = "normal";
        document.getElementById("t" + id).style.fontStyle = "normal";

        i = seleccionados.findIndex(function (item) { return (item.id == "check" + id) });
        if (i > -1) {
            seleccionados.splice(i, 1);
        }
    }
}

function selectFriend() {
    if (seleccionados.length > 0) {
        $("#div_friends").hide()
        $("#div_messages").show()
        $('select[name="friend"]').val(seleccionados.pop().value)
        $('select[name="friend"]').change()
    }
    else {
        alert("Por favor, Seleccione una opcion")
    }
}
