import tornado.web
import tornado.ioloop
from handlers import *
import os
import json
# Load data files

def readJSON(filename):
    return json.load(open(filename))

owner = readJSON("static/data/owner.json")
firmChance = readJSON("static/data/firmChance.json")


if __name__ == "__main__":
    settings = { "static_path" : os.path.join(os.path.dirname(__file__), "static")}
    application = tornado.web.Application([
        (r"/", MainHandler), 
        (r"/realtime", RealtimeSimulationHandler),
        (r"/realtimeSocket", RealTimeSimulationSocketHandler),
        (r"/tutorialtest", TuturialTestHandler, dict(owner = owner, firmChance = firmChance)),
        (r"/about", AboutHandler),
        (r"/contact", ContactHandler),
        (r'/(favicon.ico)', tornado.web.StaticFileHandler, {"path": "favicon.ico"}),
        (r"/data", DataHandler),
        (r"/income-statement", IncomeStatementHandler),
        ], debug = True, **settings)
    application.listen(80)
    tornado.ioloop.IOLoop.instance().start()