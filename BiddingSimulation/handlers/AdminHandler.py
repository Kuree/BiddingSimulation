import tornado.web
import tornado.gen
from  jinja2 import Environment, FileSystemLoader
import Settings

class AdminHandler(tornado.web.RequestHandler):
    def get(self):
        if self.get_secure_cookie("admin") == None:
            self.redirect("admin-login")
            return
        else:
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
        if self.get_secure_cookie("admin") != None:
            self.redirect(self.get_argument("next", "admin"))
        else:
            html_output = self.template.render(title="Admin Login", ContentName="Admin Control Panel")
            self.write(html_output)
    def post(self):
        id = self.get_argument("userName")
        password = self.get_argument("password")

        if id=="admin" and password == "123":
            self.set_secure_cookie("admin", "admin")
            self.redirect("/admin")
        else:
            self.redirect("/admin-login")


    def initialize(self):
        self.TEMPLATE_FILE = "adminLogin.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)




