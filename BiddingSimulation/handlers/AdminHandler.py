import tornado.web
from  jinja2 import Environment, FileSystemLoader

class AdminHandler(tornado.web.RequestHandler):
    @tornado.web.authenticated
    def get(self):
        html_output = self.template.render(title="Admin", ContentName="Admin Panel")
        self.write(html_output)
        return

    def post(self):
        html_output = self.template.render(title="Admin", ContentName="Admin Panel")
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "admin.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/")
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)

class AdminLoginHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Admin Login", ContentName="Please Login")
        self.write(html_output)
        return

    def post(self):
        id = self.get_argument("userName")
        password = self.get_argument("password")
        if id == None or password == None:
            return
        if id=="admin" and password == "123":
            self.set_secure_cookie("admin", "admin")
            self.redirect(self.get_argument("next", "/"))

    def initialize(self):
        self.TEMPLATE_FILE = "adminLogin.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)