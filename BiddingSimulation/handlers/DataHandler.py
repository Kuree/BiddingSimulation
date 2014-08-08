import tornado.web
from  jinja2 import Environment, FileSystemLoader
import json
import os
import ujson

class DataHandler(tornado.web.RequestHandler):
    def get(self):
        arg = self.get_argument("arg")
        output = ""
        filename = ""
        if(arg == "firmChance"):
            filename = "static/data/firmChance.json"
        elif(arg == "owner"):
            filename = "static/data/owner.json"
        elif(arg=="events"):
            filename = "static/data/events.json"
        elif(arg=="projects"):
            filename = "static/data/projects.json"
        elif(arg=="firms"):
            filename = "static/data/firms.json"

        if filename != "":
            with open(filename, "r") as f:
                output = f.read()
        self.write(output)