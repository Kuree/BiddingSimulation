import tornado.web
from  jinja2 import Environment, FileSystemLoader

class DetailsHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Bucknell Bidding Simulation Tutorial", ContentName="Bucknell Bidding Simulation Tutorial")
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "details.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)