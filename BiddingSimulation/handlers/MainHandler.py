import tornado.web
from  jinja2 import Environment, FileSystemLoader

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Welcome to the Bucknell Bidding Simulation", ContentName="Welcome to the Bucknell Bidding Simulation")
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "main.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)