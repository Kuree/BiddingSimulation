import tornado.web
import tornado.ioloop
from handlers import *
import os

if __name__ == "__main__":
    settings = { "static_path" : os.path.join(os.path.dirname(__file__), "static")}
    application = tornado.web.Application([
        (r"/", MainHandler), 
        (r"/tutorial-bid-form", BidFormTutorialHandler),
        (r"/tutorial-worksheet", WorkSheetTutorialHandler),
        (r"/realtime", RealtimeSimulationHandler),
        (r"/realtimeSocket", RealTimeSimulationSocketHandler),
        (r"/tutorialtest", TuturialTestHandler),
        (r"/about", AboutHandler),
        (r"/contact", ContactHandler),
        (r'/(favicon.ico)', tornado.web.StaticFileHandler, {"path": "favicon.ico"}),
        ], debug = True, **settings)
    application.listen(80)
    tornado.ioloop.IOLoop.instance().start()