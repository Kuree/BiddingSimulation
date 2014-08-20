import tornado.websocket
from  jinja2 import Environment, FileSystemLoader
import json


class PracticeSimulationHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Practice Simulation", ContentName="Practice Simulation Individually", showTimer = False)
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "practiceSimulation.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)

class PracticeTeamSimulationHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Practice Simulation", ContentName="Practice Simulation with a Team", showTimer = True)
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "practiceTeamSimulation.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)