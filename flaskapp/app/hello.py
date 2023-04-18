from flask import Flask
import socket

app = Flask(__name__)

@app.route("/")
def run():
    return "hello from flask, running on host: " + socket.gethostname()
    # return "{\"message\":\"Hello World Python v1\"}"

if __name__ == "__main__":
    app.run()