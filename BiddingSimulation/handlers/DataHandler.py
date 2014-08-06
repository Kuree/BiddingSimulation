import tornado.web
from  jinja2 import Environment, FileSystemLoader
import json
import os

class DataHandler(tornado.web.RequestHandler):
    def get(self):
        arg = self.get_argument("arg")
        output = ""
        if(arg == "firmChance"):
            output = json.dumps(self.firmChance)
        elif(arg == "owner"):
            output = json.dumps(self.owner)
        self.write(output)

    def initialize(self):
        self.firmChance = json.load(open(r"static/data/firmChance.json", "r"))
        self.owner = json.load(open(r"static/data/owner.json", "r"))