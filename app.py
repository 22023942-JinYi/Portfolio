from flask import Flask, render_template
import webbrowser

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

def open_webbrowser():
    webbrowser.open_new('http://127.0.0.1:5000')

if __name__ == '__main__':
    open_webbrowser()
    app.run(debug=True)