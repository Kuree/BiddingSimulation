import tornado.web
from  jinja2 import Environment, FileSystemLoader

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="NEED TO BE ADDED", ContentName="NEED TO BE ADDED")
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "main.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)