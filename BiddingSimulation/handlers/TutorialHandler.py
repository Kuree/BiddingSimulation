import tornado.web
from  jinja2 import Environment, FileSystemLoader

class BidFormTutorialHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Bid Form Tutorial", ContentName="Simulation Tutorial: Bid Form")
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "bidFormTutorial.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)

class WorkSheetTutorialHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Bid Form Tutorial", ContentName="Simulation Tutorial: Bid Form")
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "workSheetTutorial.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)