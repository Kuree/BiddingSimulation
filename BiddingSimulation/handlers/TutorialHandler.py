import tornado.web
from  jinja2 import Environment, FileSystemLoader

class TutorialHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Tutorial", ContentName="Simulation Tutorial")
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "tutorial.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)