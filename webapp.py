import email
import os
from types import NoneType
from urllib import response
from flask import Flask, render_template, session, redirect, url_for
from flask import Flask, jsonify, request, Response
import requests
import json
import unicodedata
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from passlib.hash import sha256_crypt

app = Flask(__name__)
# this string is used for security reasons (see CSRF)
app.secret_key = "A0Zr98j/3yX R~XHH!jmN]LWX/,?RT"
ALLOWED_EXTENSIONS = set(["png", "jpg", "jpeg", "gif", "mp4"])
SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
# instancia del objeto Flask
app.config["UPLOAD_FOLDER"] = "./static/images/profile_pic"
app.config["UPLOAD_FOLDER_post"] = "./static/images/pic_post"
app.config["UPLOAD_FOLDER_est"] = "./static/images/pic_est"


def allowed_file(file):
    file = file.split(".")
    if file[1] in ALLOWED_EXTENSIONS:
        return True
    return False


@app.route("/users/<name>")
def hello(name):
    response = requests.get("http://localhost:8000/users/" + name)
    return Response(response, mimetype="application/json")


@app.route("/", methods=["GET"])
@app.route("/index", methods=["GET"])
def index():
    """
    It process '/' and '/index' urls.
    :return: content of index.html file
    """
    if "user_name" in session:
        logged = True
        nickname = session["user_name"]
    else:
        logged = False
        nickname = ""
    return render_template("index.html", logged=logged, nickname=nickname)


def create_user_file(name, surname, email, passwd, passwd_confirmation, imag):

    response = requests.get("http://localhost:8000/verific/" + email)
    if response.json() != None:
        return process_error(
            "The email is already used, you must select a different email / Ya existe un usuario con ese nombre",
            url_for("signup"),
        )
    if passwd != passwd_confirmation:
        return process_error(
            "Your password and confirmation password do not match / Las claves no coinciden",
            url_for("signup"),
        )
    filename = secure_filename(imag.filename)
    print(imag, imag.filename)
    print(filename)
    if imag and allowed_file(filename):
        print("permitido")
        imag.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
    url = "http://localhost:8000/users/"
    create_row_data = {
        "name": name,
        "surname": surname,
        "email": email,
        "password": passwd,
        "messages": [],
        "friends": [],
        "imag": filename,
    }
    requests.post(url, json.dumps(create_row_data))
    session["user_name"] = name
    session["surname"] = surname
    session["email"] = email
    session["password"] = passwd
    session["messages"] = []
    session["friends"] = []
    session["imag"] = filename
    return redirect(url_for("home"))


@app.route("/home", methods=["GET", "POST"])
def home():
    """
    It process '/home' url (main app page)
    :return: if everything is fine, content of home.html file
    """

    if "user_name" not in session:
        return "ERROR:deberias estar logueado para usar esta opcion"
    if request.method == "POST" and request.form["message"] != "":
        post = request.files["images"]
        filename = secure_filename(post.filename)
        print(post, post.filename)
        print(filename)
        if post and allowed_file(filename) == False:
            print("no permitido")
            return render_template("errori.html")
        else:
            if post and allowed_file(filename) == True:
                print("permitido")
                post.save(os.path.join(app.config["UPLOAD_FOLDER_post"], filename))
        url = "http://localhost:8000/posts/"
        create_row_data = {
            "usr": session["email"],
            "mens": request.form["message"],
            "imgs": filename,
        }
        requests.post(url, json.dumps(create_row_data))
    response = requests.get("http://localhost:8000/posts")
    posting = response.json()
    return render_template(
        "home.html",
        logged=True,
        nickname=session["user_name"],
        email=session["email"],
        posting=posting,
    )


@app.route("/delete_post/<post>")
def delete_post(post):
    requests.delete("http://localhost:8000/posts/" + post)
    return redirect(url_for("home"))


@app.route("/update/<post>", methods=["GET", "POST"])
def update_post(post):
    print(post)
    response = requests.get("http://localhost:8000/post/" + post)
    posts = response.json()
    url = "http://localhost:8000/posts/" + post
    if request.method == "POST":
        if request.files["repimg"] == "":
            updates = {
                "usr": session["email"],
                "mens": request.form["fullname"],
                "imgs": request.form["femail"],
                "autor": [],
            }
            requests.put(url, json.dumps(updates))
            return redirect(url_for("home"))
        else:
            image = request.files["repimg"]
            filename = secure_filename(image.filename)
            print(image, image.filename)
            print(filename)
            updates = {
                "usr": session["email"],
                "mens": request.form["fullname"],
                "imgs": request.form["femail"],
                "autor": [],
            }
            requests.put(url, json.dumps(updates))
            if filename != "":
                if posts and allowed_file(filename) == False:
                    print("no permitido")
                    return render_template("errori.html")
                else:
                    if image and allowed_file(filename) == True:
                        print("permitido")
                        image.save(
                            os.path.join(app.config["UPLOAD_FOLDER_est"], filename)
                        )
                        image = request.files["repimg"]
                        updates = {
                            "usr": session["email"],
                            "mens": request.form["fullname"],
                            "imgs": filename,
                            "autor": [],
                        }
                        requests.put(url, json.dumps(updates))
                        return redirect(url_for("home"))
        return redirect(url_for("home"))

    return render_template("update.html", posts=posts)


def process_error(message, next_page):
    """

    :param message:
    :param next_page:
    :return:
    """
    return render_template("error.html", error_message=message, next=next_page)


@app.route("/signup", methods=["POST", "GET"])
def signup():
    """
    It process '/signup' url (form for creating a new user)
    :return: firstly it will render the page for filling out the new user data. Afterwards it will process these data.
    """
    if request.method == "POST":
        return process_signup()

    # The http GET method was used
    return app.send_static_file("signup.html")


def process_signup():
    faltan = []
    campos = [
        "nickname",
        "surname",
        "email",
        "passwd",
        "confirm",
        "signup_submit",
    ]
    for campo in campos:
        value = request.form.get(campo, None)
        if value is None or value == "":
            faltan.append(campo)
    if faltan:
        return render_template(
            "missingFields.html", inputs=faltan, next=url_for("signup")
        )
    return create_user_file(
        request.form["nickname"],
        request.form["surname"],
        request.form["email"],
        request.form["passwd"],
        request.form["confirm"],
        request.files["imag"],
    )


@app.route("/login", methods=["GET", "POST"])
def login():
    """
    It process '/login' url (form for login into the system)
    :return: firstly it will render the page for filling out the login data. Afterwards it will process these data.
    """
    if request.method == "POST":
        missing = []
        fields = ["email", "passwd", "login_submit"]
        for field in fields:
            value = request.form.get(field, None)
            if value is None or value == "":
                missing.append(field)
        if missing:
            return render_template(
                "missingFields.html", inputs=missing, next=url_for("login")
            )

        return load_user(request.form["email"], request.form["passwd"])

    return app.send_static_file("login.html")


def load_user(email, passwd):
    """
    It loads data for the given user (identified by email) from the data directory.
    It looks for a file whose name matches the user email
    :param email: user id
    :param passwd: password to check in order to validate the user
    :return: content of the home page (app basic page) if user exists and password is correct
    """
    response = requests.get("http://localhost:8000/verific/" + email)
    if response.json() == None:
        return process_error("User not found / No existe el usuario ", url_for("login"))
    else:
        response_data = response.json()
    if sha256_crypt.verify(str(passwd), response_data["password"]) != True:
        return process_error(
            "Incorrect password / la clave no es correcta", url_for("login")
        )
    session["email"] = response_data["email"]
    session["user_name"] = response_data["name"]
    session["surname"] = response_data["surname"]
    session["imag"] = response_data["imag"]
    session["password"] = passwd
    session["id"] = response_data["id"]
    return redirect(url_for("home"))


@app.route("/logout", methods=["GET", "POST"])
def process_logout():
    """
    It process '/logout' url (user going out of the system)
    :return: the initial app page
    """
    session.pop("user_name", None)
    return redirect(url_for("index"))


@app.route("/profile", methods=["GET", "POST"])
def profile():
    """
    It process '/profile' url (showing user data)
    :return: if user is logged, content of file edit_profile.html
    """
    if "user_name" not in session:
        return process_error(
            "you must be logged to use the app / debe registrarse antes de usar la aplicacion",
            url_for("login"),
        )
    if request.method == "POST":
        session["name"] = request.form["nickname"]
        session["password"] = request.form["passwd"]
        session["friends"] = [
            str.strip(str(friend)) for friend in request.form.getlist("friends")
        ]

        return redirect(url_for("home"))
    else:  # The http GET method was used
        return render_template(
            "edit_profile.html",
            nickname=session["user_name"],
            email=session["email"],
            passwd=session["password"],
            friends=session["friends"],
            all_users=get_all_users(session["email"]),
        )


@app.route("/friends", methods=["GET", "POST"])
def get_friends():
    if "user_name" not in session:
        return "ERROR: You must to be logged before to use the APP"

    return jsonify([friend for friend in sorted(session["friends"])])


def load_messages_from_user(user):
    """
    Get all the message stored for the given user
    :param user: the user whose message will be returned
    :return: all the message published by the given user as a list of (user, time stamp, message)
    """
    cur = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    query_string = "SELECT *FROM Post  INNER JOIN User ON Post.user_email=User.email WHERE Post.email =%s"
    cur.execute(query_string, (user,))
    fetchedData = cur.fetchall()
    fetchedData = json.dumps(fetchedData)
    d = json.JSONDecoder()
    datas = d.decode(fetchedData)
    messageu = []
    for item in datas:
        message_details = {"name": None, "message": None, "photo": None, "pht": None}
        message_details["name"] = item["name"]
        message_details["message"] = item["message"]
        message_details["photo"] = item["photo"]
        message_details["pht"] = item["pht"]
        messageu.append(message_details)
    messages_with_author = [
        (
            messageu[i]["name"],
            messageu[i]["message"],
            messageu[i]["pht"],
            messageu[i]["photo"],
        )
        for i in range(len(messageu))
    ]
    print(messages_with_author)
    cur.close()
    return messages_with_author


def get_friends_messages_with_authors():
    """
    Get all the message from those users followed by the current one (extracted from the session)
    :return: list of message, each with the form (user, time stamp, message)
    """
    message_and_authors = []
    for friend in session["friends"]:
        texts = load_messages_from_user(friend)
        message_and_authors.extend(texts)
    return message_and_authors


@app.route("/friend_messages", methods=["POST"])
def get_friend_messages():
    """
    It processes '/friend_messages' url (AJAX request to get all messages from a given friend)
    :return: JSON with messages requested
    """
    if "user_name" not in session:
        return "ERROR: You must to be logged before to use the APP"

    friend = request.form.get("friend", None)
    if friend == None or friend == "All":
        friends_messages = get_friends_messages_with_authors()
    else:
        friends_messages = load_messages_from_user(friend)
    return jsonify(
        [
            (message[0], message[1], message[2], message[3])
            for message in sorted(friends_messages, key=lambda x: x[1])
        ]
    )


def get_all_users(user):
    """
    Get all the users that a given user (parameter) can select to follow
    :param user: current user to whom possible friends will be shown
    :return: the complete list of registered users, taking out the current one
    """
    response = requests.get("http://localhost:8000/users")
    print(user)
    a = response.json()
    usuarios = []
    for item in a:
        us_details = {"email": None}
        us_details["email"] = item["email"]
        if item["email"] == user:
            pass
        else:
            usuarios.append(us_details)
    users = [(usuarios[i]["email"]) for i in range(len(usuarios))]
    return users


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8090)
