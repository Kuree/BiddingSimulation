import tornado.websocket
from  jinja2 import Environment, FileSystemLoader
import json


class TuturialTestHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Tutorial Test", ContentName="This is a test of tutorial competing with machine", firmChance = json.dumps(self.firmChance))
        self.write(html_output)
        return

    def initialize(self, owner, firmChance):
        self.TEMPLATE_FILE = "tutorialTest.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)
        self.owner = owner
        self.firmChance = firmChance